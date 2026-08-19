--
-- PostgreSQL database dump
--

\restrict IlX9K9hZtLnj70CEIpUYmvRmOibKtxF9QrHAGk427AZkXE3tTncRw45DEBDQsHj

-- Dumped from database version 17.10 (Homebrew)
-- Dumped by pg_dump version 17.10 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.signing_sessions DROP CONSTRAINT IF EXISTS "signing_sessions_createdById_fkey";
ALTER TABLE IF EXISTS ONLY public.signing_sessions DROP CONSTRAINT IF EXISTS "signing_sessions_closedById_fkey";
ALTER TABLE IF EXISTS ONLY public.signers DROP CONSTRAINT IF EXISTS "signers_sessionId_fkey";
ALTER TABLE IF EXISTS ONLY public.session_documents DROP CONSTRAINT IF EXISTS session_documents_session_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS "audit_logs_userId_fkey";
DROP INDEX IF EXISTS public.users_email_key;
DROP INDEX IF EXISTS public.signing_sessions_token_key;
DROP INDEX IF EXISTS public."signing_sessions_status_createdAt_idx";
DROP INDEX IF EXISTS public.signing_sessions_code_key;
DROP INDEX IF EXISTS public."signers_sessionId_signedAt_idx";
DROP INDEX IF EXISTS public."signers_sessionId_docNumber_key";
DROP INDEX IF EXISTS public.session_documents_session_id_orden_idx;
DROP INDEX IF EXISTS public.session_documents_original_path_key;
DROP INDEX IF EXISTS public.partes_nombre_key;
DROP INDEX IF EXISTS public.partes_activo_orden_idx;
DROP INDEX IF EXISTS public."identity_cache_docType_docNumber_key";
DROP INDEX IF EXISTS public.cargos_nombre_key;
DROP INDEX IF EXISTS public.cargos_activo_orden_idx;
DROP INDEX IF EXISTS public."audit_logs_entityType_entityId_idx";
DROP INDEX IF EXISTS public."audit_logs_action_createdAt_idx";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.signing_sessions DROP CONSTRAINT IF EXISTS signing_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.signers DROP CONSTRAINT IF EXISTS signers_pkey;
ALTER TABLE IF EXISTS ONLY public.session_documents DROP CONSTRAINT IF EXISTS session_documents_pkey;
ALTER TABLE IF EXISTS ONLY public.partes DROP CONSTRAINT IF EXISTS partes_pkey;
ALTER TABLE IF EXISTS ONLY public.identity_cache DROP CONSTRAINT IF EXISTS identity_cache_pkey;
ALTER TABLE IF EXISTS ONLY public.cargos DROP CONSTRAINT IF EXISTS cargos_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.signing_sessions;
DROP TABLE IF EXISTS public.signers;
DROP TABLE IF EXISTS public.session_documents;
DROP TABLE IF EXISTS public.partes;
DROP TABLE IF EXISTS public.identity_cache;
DROP TABLE IF EXISTS public.cargos;
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TYPE IF EXISTS public."SignMethod";
DROP TYPE IF EXISTS public."SessionStatus";
DROP TYPE IF EXISTS public."Role";
DROP TYPE IF EXISTS public."Modalidad";
DROP TYPE IF EXISTS public."DocType";
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: DocType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DocType" AS ENUM (
    'DNI',
    'RUC'
);


--
-- Name: Modalidad; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Modalidad" AS ENUM (
    'PRESENCIAL',
    'VIRTUAL',
    'MIXTA'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'OPERADOR'
);


--
-- Name: SessionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SessionStatus" AS ENUM (
    'OPEN',
    'CLOSED'
);


--
-- Name: SignMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SignMethod" AS ENUM (
    'DRAWN',
    'UPLOADED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "actorType" text NOT NULL,
    "userId" text,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text,
    ip text,
    "userAgent" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: cargos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cargos (
    id text NOT NULL,
    nombre text NOT NULL,
    orden integer DEFAULT 0 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: identity_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.identity_cache (
    id text NOT NULL,
    "docType" public."DocType" NOT NULL,
    "docNumber" text NOT NULL,
    response jsonb NOT NULL,
    "fetchedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: partes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partes (
    id text NOT NULL,
    nombre text NOT NULL,
    orden integer DEFAULT 0 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: session_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_documents (
    id text NOT NULL,
    session_id text NOT NULL,
    original_name text NOT NULL,
    original_path text NOT NULL,
    signed_path text,
    orden integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: signers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signers (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    "docType" public."DocType" NOT NULL,
    "docNumber" text NOT NULL,
    "displayName" text NOT NULL,
    "repNombre" text,
    "repDni" text,
    cargo text NOT NULL,
    parte text,
    verified boolean DEFAULT false NOT NULL,
    "verificationRaw" jsonb,
    "signMethod" public."SignMethod" NOT NULL,
    "imagePath" text NOT NULL,
    "imageSha256" text NOT NULL,
    "signedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip text NOT NULL,
    "userAgent" text NOT NULL,
    entidad text
);


--
-- Name: signing_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signing_sessions (
    id text NOT NULL,
    code text NOT NULL,
    token text NOT NULL,
    asunto text NOT NULL,
    expediente text NOT NULL,
    "fechaAudiencia" timestamp(3) without time zone NOT NULL,
    sede text NOT NULL,
    modalidad public."Modalidad" DEFAULT 'PRESENCIAL'::public."Modalidad" NOT NULL,
    status public."SessionStatus" DEFAULT 'OPEN'::public."SessionStatus" NOT NULL,
    "createdById" text NOT NULL,
    "closedById" text,
    "closedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    nombre text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" DEFAULT 'OPERADOR'::public."Role" NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
142ed3ce-2e37-4e96-9d98-9fe26dfa8932	731bc10c4c9b3c8f7cb87e2733506af286aa93e46c7afab7afe27d5ee27905c0	2026-08-19 08:35:18.381715-05	20260731142106_init	\N	\N	2026-08-19 08:35:18.365119-05	1
5a2b4acb-6bc4-4e2d-b6de-4666b0b6e9c4	63b0b680bdb328ad001e8c5f98dd762a2b80deb70443a0ea245e03855c9731a1	2026-08-19 09:51:55.768499-05	20260819145022_add_session_documents	\N	\N	2026-08-19 09:51:55.758066-05	1
5ef31a11-4aa4-45e2-8048-bec56dae094c	9f3f3e9e9533dbefdfad20b2689bc099b154974da67c8eb5ac45e11455ddd238	2026-08-19 08:35:18.385648-05	20260818162822_add_cargos_partes	\N	\N	2026-08-19 08:35:18.381978-05	1
aa642556-3c08-410c-a2df-45592109b42c	bd964e4e2fe0d1045548afefa636661e289b910ed40d8f9e1ed7562e0ae225c7	2026-08-19 08:35:18.38668-05	20260819002203_add_entidad_signer	\N	\N	2026-08-19 08:35:18.385921-05	1
d32599d3-6712-4531-83ea-fd2353f07c2d	5909e40caf4b12d4cb3e40a17b73771f4605622dded9edb2c4b44e08dbe41104	2026-08-19 08:35:18.387509-05	20260819012808_make_parte_optional	\N	\N	2026-08-19 08:35:18.386896-05	1
20b16264-fe4d-479f-88a7-25dbb7872320	c553617652b742284b4530cf429622504ae5dfb46712e822b9c7d6e2a645f7d5	2026-08-19 08:35:18.38824-05	20260819012849_add_documento_pdf	\N	\N	2026-08-19 08:35:18.387699-05	1
1bf6218a-827d-4b0c-923a-4be783b3b588	cff18f40c23236a69d1f5eef07b21f7635528e16878105c0e4d0767867e6c2a4	2026-08-19 08:35:18.3889-05	20260819121842_add_documento_firmado_pdf	\N	\N	2026-08-19 08:35:18.38841-05	1
97cbf74c-8b00-428c-8f15-312e147f5d03	147dc47d145bce66ddee79570ed6f4ca0187f30476dc930ad5e51f66e3be9709	\N	20260819145022_add_session_documents	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260819145022_add_session_documents\n\nDatabase error code: 42P01\n\nDatabase error:\nERROR: relation "session_documents" does not exist\n\nPosition:\n[1m  5[0m   - You are about to drop the column `documentoPdf` on the `signing_sessions` table. All the data in the column will be lost.\n[1m  6[0m\n[1m  7[0m */\n[1m  8[0m\n[1m  9[0m -- Migrate existing single-document sessions to the new table\n[1m 10[1;31m INSERT INTO "session_documents" ("id", "session_id", "original_name", "original_path", "signed_path", "orden", "created_at", "updated_at")[0m\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P01), message: "relation \\"session_documents\\" does not exist", detail: None, hint: None, position: Some(Original(355)), where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("parse_relation.c"), line: Some(1452), routine: Some("parserOpenTable") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260819145022_add_session_documents"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20260819145022_add_session_documents"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:260	2026-08-19 09:51:55.213509-05	2026-08-19 09:51:08.964127-05	0
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, "actorType", "userId", action, "entityType", "entityId", ip, "userAgent", metadata, "createdAt") FROM stdin;
cmt04w89l000o2nwj48sqxtpv	SYSTEM	\N	SEED_EXECUTED	User	cmt04w82x00002nwjp7pocug8	\N	\N	{"cargos": 15, "partes": 7, "usuarios": ["admin@ankawa.local", "secretaria@ankawa.local"]}	2026-08-19 13:35:20.025
\.


--
-- Data for Name: cargos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cargos (id, nombre, orden, activo, "createdAt", "updatedAt") FROM stdin;
cmt04w89400022nwjrebr43vm	Representante legal del Centro	0	t	2026-08-19 13:35:20.009	2026-08-19 13:35:20.009
cmt04w89600032nwjqmbbmch8	Representante común	1	t	2026-08-19 13:35:20.011	2026-08-19 13:35:20.011
cmt04w89700042nwjhelmw06i	Funcionario público	2	t	2026-08-19 13:35:20.012	2026-08-19 13:35:20.012
cmt04w89800052nwjna44e20q	Adjudicador único	3	t	2026-08-19 13:35:20.012	2026-08-19 13:35:20.012
cmt04w89900062nwjas4yp1co	Adjudicador de parte	4	t	2026-08-19 13:35:20.013	2026-08-19 13:35:20.013
cmt04w89900072nwjs8hvhg0z	Presidente de la JPRD	5	t	2026-08-19 13:35:20.014	2026-08-19 13:35:20.014
cmt04w89a00082nwjl49csygp	Alcalde	6	t	2026-08-19 13:35:20.014	2026-08-19 13:35:20.014
cmt04w89b00092nwj8w6kf46s	Gerente municipal	7	t	2026-08-19 13:35:20.015	2026-08-19 13:35:20.015
cmt04w89b000a2nwjc3fb2vft	Director de administración	8	t	2026-08-19 13:35:20.016	2026-08-19 13:35:20.016
cmt04w89c000b2nwjrx7u7cwn	Secretario(a) arbitral	9	t	2026-08-19 13:35:20.016	2026-08-19 13:35:20.016
cmt04w89c000c2nwjlb43is9w	Árbitro	10	t	2026-08-19 13:35:20.017	2026-08-19 13:35:20.017
cmt04w89d000d2nwjn4jue00n	Árbitro único	11	t	2026-08-19 13:35:20.018	2026-08-19 13:35:20.018
cmt04w89e000e2nwjwnc7sc79	Abogado(a)	12	t	2026-08-19 13:35:20.018	2026-08-19 13:35:20.018
cmt04w89e000f2nwj3nedyqe3	Perito	13	t	2026-08-19 13:35:20.019	2026-08-19 13:35:20.019
cmt04w89f000g2nwjb80gnqxa	Testigo	14	t	2026-08-19 13:35:20.019	2026-08-19 13:35:20.019
\.


--
-- Data for Name: identity_cache; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.identity_cache (id, "docType", "docNumber", response, "fetchedAt") FROM stdin;
\.


--
-- Data for Name: partes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.partes (id, nombre, orden, activo, "createdAt", "updatedAt") FROM stdin;
cmt04w89g000h2nwjw0dev1o8	Demandante	0	t	2026-08-19 13:35:20.02	2026-08-19 13:35:20.02
cmt04w89h000i2nwj3t5ymj06	Demandado	1	t	2026-08-19 13:35:20.022	2026-08-19 13:35:20.022
cmt04w89i000j2nwj0lp2xum2	Tribunal arbitral	2	t	2026-08-19 13:35:20.022	2026-08-19 13:35:20.022
cmt04w89i000k2nwjsngs7x50	Secretaría arbitral	3	t	2026-08-19 13:35:20.023	2026-08-19 13:35:20.023
cmt04w89j000l2nwjto6n6rxj	Centro arbitral	4	t	2026-08-19 13:35:20.023	2026-08-19 13:35:20.023
cmt04w89j000m2nwj8pj16nap	Comunidad	5	t	2026-08-19 13:35:20.024	2026-08-19 13:35:20.024
cmt04w89k000n2nwj50szk36h	Municipalidad	6	t	2026-08-19 13:35:20.024	2026-08-19 13:35:20.024
\.


--
-- Data for Name: session_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session_documents (id, session_id, original_name, original_path, signed_path, orden, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: signers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.signers (id, "sessionId", "docType", "docNumber", "displayName", "repNombre", "repDni", cargo, parte, verified, "verificationRaw", "signMethod", "imagePath", "imageSha256", "signedAt", ip, "userAgent", entidad) FROM stdin;
\.


--
-- Data for Name: signing_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.signing_sessions (id, code, token, asunto, expediente, "fechaAudiencia", sede, modalidad, status, "createdById", "closedById", "closedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, nombre, "passwordHash", role, activo, "createdAt", "updatedAt") FROM stdin;
cmt04w82x00002nwjp7pocug8	admin@ankawa.local	Administrador CARD	$2b$12$/ZMOkM5J1oz.izBQNo014uWDg86kpWnCpqMyZywVC4EQZiB7dnGwK	ADMIN	t	2026-08-19 13:35:19.785	2026-08-19 13:35:19.785
cmt04w89300012nwjzwd6cqqb	secretaria@ankawa.local	Secretaría Arbitral	$2b$12$Kx6XNL2Wh0sDrjc8utCU4encF/lASGJB3DCGLGRnSBDxoPrLvNt3K	OPERADOR	t	2026-08-19 13:35:20.007	2026-08-19 13:35:20.007
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: cargos cargos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cargos
    ADD CONSTRAINT cargos_pkey PRIMARY KEY (id);


--
-- Name: identity_cache identity_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.identity_cache
    ADD CONSTRAINT identity_cache_pkey PRIMARY KEY (id);


--
-- Name: partes partes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partes
    ADD CONSTRAINT partes_pkey PRIMARY KEY (id);


--
-- Name: session_documents session_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_documents
    ADD CONSTRAINT session_documents_pkey PRIMARY KEY (id);


--
-- Name: signers signers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signers
    ADD CONSTRAINT signers_pkey PRIMARY KEY (id);


--
-- Name: signing_sessions signing_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signing_sessions
    ADD CONSTRAINT signing_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_action_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_action_createdAt_idx" ON public.audit_logs USING btree (action, "createdAt");


--
-- Name: audit_logs_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_entityType_entityId_idx" ON public.audit_logs USING btree ("entityType", "entityId");


--
-- Name: cargos_activo_orden_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cargos_activo_orden_idx ON public.cargos USING btree (activo, orden);


--
-- Name: cargos_nombre_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX cargos_nombre_key ON public.cargos USING btree (nombre);


--
-- Name: identity_cache_docType_docNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "identity_cache_docType_docNumber_key" ON public.identity_cache USING btree ("docType", "docNumber");


--
-- Name: partes_activo_orden_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX partes_activo_orden_idx ON public.partes USING btree (activo, orden);


--
-- Name: partes_nombre_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX partes_nombre_key ON public.partes USING btree (nombre);


--
-- Name: session_documents_original_path_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX session_documents_original_path_key ON public.session_documents USING btree (original_path);


--
-- Name: session_documents_session_id_orden_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_documents_session_id_orden_idx ON public.session_documents USING btree (session_id, orden);


--
-- Name: signers_sessionId_docNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "signers_sessionId_docNumber_key" ON public.signers USING btree ("sessionId", "docNumber");


--
-- Name: signers_sessionId_signedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "signers_sessionId_signedAt_idx" ON public.signers USING btree ("sessionId", "signedAt");


--
-- Name: signing_sessions_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX signing_sessions_code_key ON public.signing_sessions USING btree (code);


--
-- Name: signing_sessions_status_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "signing_sessions_status_createdAt_idx" ON public.signing_sessions USING btree (status, "createdAt");


--
-- Name: signing_sessions_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX signing_sessions_token_key ON public.signing_sessions USING btree (token);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: session_documents session_documents_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_documents
    ADD CONSTRAINT session_documents_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.signing_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: signers signers_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signers
    ADD CONSTRAINT "signers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public.signing_sessions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: signing_sessions signing_sessions_closedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signing_sessions
    ADD CONSTRAINT "signing_sessions_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: signing_sessions signing_sessions_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signing_sessions
    ADD CONSTRAINT "signing_sessions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict IlX9K9hZtLnj70CEIpUYmvRmOibKtxF9QrHAGk427AZkXE3tTncRw45DEBDQsHj

