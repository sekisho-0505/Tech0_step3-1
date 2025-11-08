-- 初期スキーマ（要件定義書 v2.0 より抜粋）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TYPE price_status AS ENUM ('draft', 'approved', 'rejected');
CREATE TYPE risk_level AS ENUM ('safe', 'warning', 'danger');

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    unit_cost_per_kg NUMERIC(14,3) NOT NULL CHECK (unit_cost_per_kg > 0),
    unit_price_per_kg NUMERIC(14,3) CHECK (unit_price_per_kg > 0),
    target_margin_rate NUMERIC(6,4) CHECK (target_margin_rate >= 0 AND target_margin_rate < 1),
    min_margin_rate NUMERIC(6,4) CHECK (min_margin_rate >= 0 AND min_margin_rate < 1),
    unit VARCHAR(10) DEFAULT 'kg',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.price_simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    simulation_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    input_cost_per_kg NUMERIC(14,3) NOT NULL CHECK (input_cost_per_kg > 0),
    target_margin_rate NUMERIC(6,4) NOT NULL CHECK (target_margin_rate >= 0 AND target_margin_rate < 1),
    calculated_price_per_kg NUMERIC(14,3) NOT NULL CHECK (calculated_price_per_kg > 0),
    selected_price_per_kg NUMERIC(14,3) CHECK (selected_price_per_kg > 0),
    quantity_kg NUMERIC(14,3) CHECK (quantity_kg >= 0),
    gross_profit_total NUMERIC(16,2),
    parameters JSONB DEFAULT '{}'::jsonb,
    status price_status DEFAULT 'draft',
    notes TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_simulations_product ON public.price_simulations(product_id);
CREATE INDEX idx_simulations_date ON public.price_simulations(simulation_at DESC);
CREATE INDEX idx_simulations_status ON public.price_simulations(status);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_simulations ENABLE ROW LEVEL SECURITY;
