--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    employee_id character varying NOT NULL,
    date timestamp without time zone DEFAULT now(),
    present boolean DEFAULT true
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- Name: borrowers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.borrowers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    phone text,
    amount_borrowed numeric(10,2) NOT NULL,
    amount_repaid numeric(10,2) DEFAULT '0'::numeric,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.borrowers OWNER TO postgres;

--
-- Name: company_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_info (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    address text,
    phone text,
    email text,
    gst_number text,
    logo text,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.company_info OWNER TO postgres;

--
-- Name: depositors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.depositors (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    amount numeric(10,2) NOT NULL,
    purpose text,
    returned boolean DEFAULT false,
    returned_amount numeric(10,2) DEFAULT '0'::numeric,
    date timestamp without time zone DEFAULT now()
);


ALTER TABLE public.depositors OWNER TO postgres;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    "position" text,
    daily_pay numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    category text DEFAULT 'other'::text,
    date timestamp without time zone DEFAULT now()
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    item_id character varying NOT NULL,
    current_stock integer DEFAULT 0,
    last_updated timestamp without time zone DEFAULT now()
);


ALTER TABLE public.inventory OWNER TO postgres;

--
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    price_per_unit numeric(10,2) NOT NULL,
    category text DEFAULT 'other'::text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.items OWNER TO postgres;

--
-- Name: online_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.online_payments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    amount numeric(10,2) NOT NULL,
    method text NOT NULL,
    transaction_ref text,
    date timestamp without time zone DEFAULT now()
);


ALTER TABLE public.online_payments OWNER TO postgres;

--
-- Name: salary_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salary_payments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    employee_id character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    month text NOT NULL,
    year integer NOT NULL,
    date timestamp without time zone DEFAULT now()
);


ALTER TABLE public.salary_payments OWNER TO postgres;

--
-- Name: sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    item_id character varying NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    customer_name text,
    date timestamp without time zone DEFAULT now()
);


ALTER TABLE public.sales OWNER TO postgres;

--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (id, employee_id, date, present) FROM stdin;
\.


--
-- Data for Name: borrowers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.borrowers (id, name, phone, amount_borrowed, amount_repaid, created_at) FROM stdin;
\.


--
-- Data for Name: company_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_info (id, name, address, phone, email, gst_number, logo, updated_at) FROM stdin;
\.


--
-- Data for Name: depositors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.depositors (id, name, amount, purpose, returned, returned_amount, date) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, name, "position", daily_pay, created_at) FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, description, amount, category, date) FROM stdin;
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory (id, item_id, current_stock, last_updated) FROM stdin;
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items (id, name, price_per_unit, category, created_at) FROM stdin;
\.


--
-- Data for Name: online_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.online_payments (id, amount, method, transaction_ref, date) FROM stdin;
\.


--
-- Data for Name: salary_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salary_payments (id, employee_id, amount, month, year, date) FROM stdin;
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales (id, item_id, quantity, unit_price, total, customer_name, date) FROM stdin;
\.


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: borrowers borrowers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.borrowers
    ADD CONSTRAINT borrowers_pkey PRIMARY KEY (id);


--
-- Name: company_info company_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_info
    ADD CONSTRAINT company_info_pkey PRIMARY KEY (id);


--
-- Name: depositors depositors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depositors
    ADD CONSTRAINT depositors_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: online_payments online_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.online_payments
    ADD CONSTRAINT online_payments_pkey PRIMARY KEY (id);


--
-- Name: salary_payments salary_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_payments
    ADD CONSTRAINT salary_payments_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_employee_id_employees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_employee_id_employees_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: inventory inventory_item_id_items_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_item_id_items_id_fk FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: salary_payments salary_payments_employee_id_employees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_payments
    ADD CONSTRAINT salary_payments_employee_id_employees_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: sales sales_item_id_items_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_item_id_items_id_fk FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- PostgreSQL database dump complete
--

