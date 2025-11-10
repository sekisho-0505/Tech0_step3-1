"""Data import endpoints."""
from __future__ import annotations

import io
import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
import pandas as pd

from app.api.deps import get_db
from app.models import ImportLog, MonthlyRevenue, Product, SalesData
from app.schemas import round_jpy

router = APIRouter()


@router.post("/monthly-revenue")
def save_monthly_revenue(
    year_month: str,
    total_revenue: float,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    月次総売上高を保存

    Args:
        year_month: 対象年月（YYYY-MM形式）
        total_revenue: 総売上高（円）
        notes: 備考
        db: データベースセッション

    Returns:
        保存結果
    """
    try:
        # 日付のパース
        target_date = datetime.strptime(year_month, "%Y-%m").date()

        # 既存データの確認
        existing = (
            db.query(MonthlyRevenue)
            .filter(MonthlyRevenue.year_month == target_date)
            .first()
        )

        if existing:
            # 更新
            existing.total_revenue = Decimal(str(total_revenue))
            existing.notes = notes
            message = "月次総売上高を更新しました"
        else:
            # 新規作成
            monthly_revenue = MonthlyRevenue(
                year_month=target_date,
                total_revenue=Decimal(str(total_revenue)),
                notes=notes,
            )
            db.add(monthly_revenue)
            message = "月次総売上高を登録しました"

        db.commit()

        return {
            "success": True,
            "message": message,
            "year_month": year_month,
            "total_revenue": total_revenue,
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "INVALID_PARAM", "message": "年月の形式が不正です（YYYY-MM形式で指定してください）"}},
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail={"error": {"code": "DATABASE_ERROR", "message": str(e)}},
        )


@router.get("/monthly-revenue")
def get_monthly_revenue_list(
    limit: int = 12,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """
    月次総売上高の一覧を取得

    Args:
        limit: 取得件数
        offset: オフセット
        db: データベースセッション

    Returns:
        月次総売上高リスト
    """
    try:
        revenues = (
            db.query(MonthlyRevenue)
            .order_by(MonthlyRevenue.year_month.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

        return [
            {
                "id": str(revenue.id),
                "year_month": revenue.year_month.strftime("%Y-%m"),
                "total_revenue": float(revenue.total_revenue),
                "notes": revenue.notes,
                "created_at": revenue.created_at.isoformat() if revenue.created_at else None,
            }
            for revenue in revenues
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": {"code": "DATABASE_ERROR", "message": str(e)}},
        )


@router.post("/excel")
async def import_excel(
    file: UploadFile = File(...),
    import_type: str = "products",
    db: Session = Depends(get_db),
):
    """
    Excelファイルからデータをインポート

    Args:
        file: アップロードされたExcelファイル
        import_type: インポートタイプ（products または sales）
        db: データベースセッション

    Returns:
        インポート結果
    """
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "INVALID_FILE", "message": "Excelファイルをアップロードしてください"}},
        )

    try:
        # ファイルを読み込む
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))

        imported_count = 0
        skipped_count = 0
        errors = []

        if import_type == "products":
            # 商品データのインポート
            for index, row in df.iterrows():
                try:
                    # 必須カラムのチェック
                    if pd.isna(row.get('商品コード')) or pd.isna(row.get('商品名')):
                        skipped_count += 1
                        errors.append({
                            "row": index + 2,
                            "reason": "商品コードまたは商品名が空です",
                        })
                        continue

                    # 既存データの確認
                    existing = db.query(Product).filter(
                        Product.product_code == str(row['商品コード'])
                    ).first()

                    if existing:
                        # 更新
                        existing.product_name = str(row['商品名'])
                        if not pd.isna(row.get('原価')):
                            existing.unit_cost_per_kg = Decimal(str(row['原価']))
                        if not pd.isna(row.get('単価')):
                            existing.unit_price_per_kg = Decimal(str(row['単価']))
                    else:
                        # 新規作成
                        product = Product(
                            product_code=str(row['商品コード']),
                            product_name=str(row['商品名']),
                            unit_cost_per_kg=Decimal(str(row.get('原価', 0))),
                            unit_price_per_kg=Decimal(str(row.get('単価', 0))) if not pd.isna(row.get('単価')) else None,
                        )
                        db.add(product)

                    imported_count += 1

                except Exception as e:
                    skipped_count += 1
                    errors.append({
                        "row": index + 2,
                        "reason": str(e),
                    })

        # インポートログを保存
        import_log = ImportLog(
            import_type=import_type,
            file_name=file.filename,
            total_rows=len(df),
            imported_rows=imported_count,
            skipped_rows=skipped_count,
            error_details={"errors": errors} if errors else None,
        )
        db.add(import_log)
        db.commit()

        return {
            "success": True,
            "imported": imported_count,
            "skipped": skipped_count,
            "errors": errors,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail={"error": {"code": "IMPORT_ERROR", "message": f"インポート処理でエラーが発生しました: {str(e)}"}},
        )
