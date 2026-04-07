CREATE DATABASE IF NOT EXISTS swe_project
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE swe_project;

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS stores (
  id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL,
  owner_account_id VARCHAR(64) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS customer_snapshots (
  id VARCHAR(64) NOT NULL,
  external_reference_id VARCHAR(128) NOT NULL,
  store_id VARCHAR(64) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  masked_contact VARCHAR(255) NULL,
  masked_address VARCHAR(255) NULL,
  snapshot_status VARCHAR(32) NOT NULL,
  last_synced_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_customer_snapshots_store_external_ref (store_id, external_reference_id),
  KEY idx_customer_snapshots_status (snapshot_status),
  KEY idx_customer_snapshots_last_synced_at (last_synced_at),
  CONSTRAINT fk_customer_snapshots_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS order_snapshots (
  id VARCHAR(64) NOT NULL,
  external_reference_id VARCHAR(128) NOT NULL,
  store_id VARCHAR(64) NOT NULL,
  customer_snapshot_id VARCHAR(64) NULL,
  order_number VARCHAR(128) NOT NULL,
  order_status VARCHAR(64) NOT NULL,
  snapshot_status VARCHAR(32) NOT NULL,
  last_synced_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_order_snapshots_store_external_ref (store_id, external_reference_id),
  KEY idx_order_snapshots_order_number (order_number),
  KEY idx_order_snapshots_status (snapshot_status),
  KEY idx_order_snapshots_last_synced_at (last_synced_at),
  CONSTRAINT fk_order_snapshots_store
    FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT fk_order_snapshots_customer_snapshot
    FOREIGN KEY (customer_snapshot_id) REFERENCES customer_snapshots(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS product_snapshots (
  id VARCHAR(64) NOT NULL,
  external_reference_id VARCHAR(128) NOT NULL,
  store_id VARCHAR(64) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_status VARCHAR(64) NULL,
  snapshot_status VARCHAR(32) NOT NULL,
  last_synced_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_product_snapshots_store_external_ref (store_id, external_reference_id),
  KEY idx_product_snapshots_name (product_name),
  KEY idx_product_snapshots_status (snapshot_status),
  KEY idx_product_snapshots_last_synced_at (last_synced_at),
  CONSTRAINT fk_product_snapshots_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS chatbot_sessions (
  id VARCHAR(64) NOT NULL,
  store_id VARCHAR(64) NOT NULL,
  customer_id VARCHAR(64) NOT NULL,
  session_status VARCHAR(32) NOT NULL,
  knowledge_source_version VARCHAR(128) NULL,
  started_at DATETIME(3) NOT NULL,
  last_message_at DATETIME(3) NOT NULL,
  handoff_requested_at DATETIME(3) NULL,
  expired_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_chatbot_sessions_customer_id (customer_id),
  KEY idx_chatbot_sessions_status (session_status),
  KEY idx_chatbot_sessions_last_message_at (last_message_at),
  KEY idx_chatbot_sessions_started_at (started_at),
  KEY idx_chatbot_sessions_expired_at (expired_at),
  CONSTRAINT fk_chatbot_sessions_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS inquiries (
  id VARCHAR(64) NOT NULL,
  store_id VARCHAR(64) NOT NULL,
  customer_id VARCHAR(64) NOT NULL,
  order_id VARCHAR(64) NULL,
  product_id VARCHAR(64) NULL,
  linked_chatbot_session_id VARCHAR(64) NULL,
  inquiry_type VARCHAR(32) NOT NULL,
  inquiry_channel VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL,
  assigned_operator_id VARCHAR(64) NULL,
  hold_reason_code VARCHAR(64) NULL,
  resolve_reason_code VARCHAR(64) NULL,
  opened_at DATETIME(3) NOT NULL,
  last_message_at DATETIME(3) NOT NULL,
  last_response_at DATETIME(3) NULL,
  closed_at DATETIME(3) NULL,
  expired_at DATETIME(3) NULL,
  is_test BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_inquiries_customer_id (customer_id),
  KEY idx_inquiries_status (status),
  KEY idx_inquiries_assigned_operator_id (assigned_operator_id),
  KEY idx_inquiries_last_message_at (last_message_at),
  KEY idx_inquiries_opened_at (opened_at),
  KEY idx_inquiries_closed_at (closed_at),
  KEY idx_inquiries_is_test (is_test),
  KEY idx_inquiries_status_last_message_at (status, last_message_at),
  KEY idx_inquiries_customer_opened_at (customer_id, opened_at),
  KEY idx_inquiries_linked_chatbot_session_id (linked_chatbot_session_id),
  CONSTRAINT fk_inquiries_store
    FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT fk_inquiries_linked_chatbot_session
    FOREIGN KEY (linked_chatbot_session_id) REFERENCES chatbot_sessions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS inquiry_messages (
  id VARCHAR(64) NOT NULL,
  inquiry_id VARCHAR(64) NOT NULL,
  sender_type VARCHAR(32) NOT NULL,
  content_raw TEXT NOT NULL,
  content_display TEXT NOT NULL,
  created_at DATETIME(3) NOT NULL,
  created_by_customer_id VARCHAR(64) NULL,
  created_by_operator_id VARCHAR(64) NULL,
  PRIMARY KEY (id),
  KEY idx_inquiry_messages_inquiry_created_at (inquiry_id, created_at),
  KEY idx_inquiry_messages_sender_type (sender_type),
  KEY idx_inquiry_messages_created_by_customer_id (created_by_customer_id),
  KEY idx_inquiry_messages_created_by_operator_id (created_by_operator_id),
  CONSTRAINT fk_inquiry_messages_inquiry
    FOREIGN KEY (inquiry_id) REFERENCES inquiries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(64) NOT NULL,
  chatbot_session_id VARCHAR(64) NOT NULL,
  sender_type VARCHAR(32) NOT NULL,
  message_type VARCHAR(32) NOT NULL,
  content_raw TEXT NOT NULL,
  content_display TEXT NOT NULL,
  sent_at DATETIME(3) NOT NULL,
  created_by_customer_id VARCHAR(64) NULL,
  created_by_system BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id),
  KEY idx_chat_messages_session_sent_at (chatbot_session_id, sent_at),
  KEY idx_chat_messages_sender_type (sender_type),
  KEY idx_chat_messages_message_type (message_type),
  KEY idx_chat_messages_created_by_customer_id (created_by_customer_id),
  CONSTRAINT fk_chat_messages_chatbot_session
    FOREIGN KEY (chatbot_session_id) REFERENCES chatbot_sessions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS attachments (
  id VARCHAR(64) NOT NULL,
  owner_type VARCHAR(32) NOT NULL,
  owner_id VARCHAR(64) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(128) NOT NULL,
  file_size BIGINT NOT NULL,
  storage_key VARCHAR(255) NOT NULL,
  preview_status VARCHAR(32) NOT NULL,
  uploaded_by_type VARCHAR(32) NOT NULL,
  uploaded_by_customer_id VARCHAR(64) NULL,
  uploaded_by_operator_id VARCHAR(64) NULL,
  created_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_attachments_owner (owner_type, owner_id, created_at),
  KEY idx_attachments_preview_status (preview_status),
  KEY idx_attachments_uploaded_by_customer_id (uploaded_by_customer_id),
  KEY idx_attachments_uploaded_by_operator_id (uploaded_by_operator_id),
  KEY idx_attachments_owner_preview (owner_type, owner_id, preview_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS internal_notes (
  id VARCHAR(64) NOT NULL,
  inquiry_id VARCHAR(64) NOT NULL,
  operator_id VARCHAR(64) NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NULL,
  PRIMARY KEY (id),
  KEY idx_internal_notes_inquiry_created_at (inquiry_id, created_at),
  CONSTRAINT fk_internal_notes_inquiry
    FOREIGN KEY (inquiry_id) REFERENCES inquiries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS inquiry_relations (
  id VARCHAR(64) NOT NULL,
  source_inquiry_id VARCHAR(64) NOT NULL,
  target_inquiry_id VARCHAR(64) NOT NULL,
  relation_type VARCHAR(32) NOT NULL,
  created_by_operator_id VARCHAR(64) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_inquiry_relations_source (source_inquiry_id),
  KEY idx_inquiry_relations_target (target_inquiry_id),
  KEY idx_inquiry_relations_type (relation_type),
  CONSTRAINT fk_inquiry_relations_source
    FOREIGN KEY (source_inquiry_id) REFERENCES inquiries(id),
  CONSTRAINT fk_inquiry_relations_target
    FOREIGN KEY (target_inquiry_id) REFERENCES inquiries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS ai_summaries (
  id VARCHAR(64) NOT NULL,
  owner_type VARCHAR(32) NOT NULL,
  owner_id VARCHAR(64) NOT NULL,
  summary_text TEXT NOT NULL,
  source_scope_kind VARCHAR(64) NULL,
  generated_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ai_summaries_owner (owner_type, owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS abuse_detection_results (
  id VARCHAR(64) NOT NULL,
  owner_type VARCHAR(32) NOT NULL,
  owner_id VARCHAR(64) NOT NULL,
  detection_status VARCHAR(32) NOT NULL,
  detected_category_set JSON NULL,
  severity VARCHAR(32) NOT NULL,
  masked_segment_summary TEXT NULL,
  analyzed_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_abuse_detection_owner (owner_type, owner_id),
  KEY idx_abuse_detection_status (detection_status),
  KEY idx_abuse_detection_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS faq_articles (
  id VARCHAR(64) NOT NULL,
  store_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by_operator_id VARCHAR(64) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_faq_articles_store_active (store_id, is_active),
  CONSTRAINT fk_faq_articles_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS policy_documents (
  id VARCHAR(64) NOT NULL,
  store_id VARCHAR(64) NOT NULL,
  policy_type VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by_operator_id VARCHAR(64) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_policy_documents_store_active (store_id, is_active),
  KEY idx_policy_documents_policy_type (policy_type),
  CONSTRAINT fk_policy_documents_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS response_presets (
  id VARCHAR(64) NOT NULL,
  store_id VARCHAR(64) NOT NULL,
  preset_title VARCHAR(255) NOT NULL,
  preset_body TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by_operator_id VARCHAR(64) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_response_presets_store_active (store_id, is_active),
  CONSTRAINT fk_response_presets_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS chatbot_knowledge_files (
  id VARCHAR(64) NOT NULL,
  store_id VARCHAR(64) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  storage_key VARCHAR(255) NULL,
  mime_type VARCHAR(128) NOT NULL,
  upload_status VARCHAR(32) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_by_operator_id VARCHAR(64) NOT NULL,
  uploaded_at DATETIME(3) NOT NULL,
  activated_at DATETIME(3) NULL,
  PRIMARY KEY (id),
  KEY idx_chatbot_knowledge_files_store_active (store_id, is_active),
  KEY idx_chatbot_knowledge_files_upload_status (upload_status),
  KEY idx_chatbot_knowledge_files_uploaded_at (uploaded_at),
  CONSTRAINT fk_chatbot_knowledge_files_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS external_reference_mappings (
  id VARCHAR(64) NOT NULL,
  store_id VARCHAR(64) NOT NULL,
  source_entity_type VARCHAR(32) NOT NULL,
  external_reference_id VARCHAR(128) NOT NULL,
  internal_entity_type VARCHAR(32) NOT NULL,
  internal_entity_id VARCHAR(64) NOT NULL,
  mapped_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_external_reference_mappings (store_id, source_entity_type, external_reference_id),
  KEY idx_external_reference_mappings_internal (internal_entity_type, internal_entity_id),
  CONSTRAINT fk_external_reference_mappings_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS integration_event_logs (
  id VARCHAR(64) NOT NULL,
  store_id VARCHAR(64) NOT NULL,
  external_event_id VARCHAR(128) NOT NULL,
  canonical_event_type VARCHAR(64) NOT NULL,
  source_entity_type VARCHAR(32) NOT NULL,
  source_entity_reference_id VARCHAR(128) NOT NULL,
  external_occurred_at DATETIME(3) NOT NULL,
  processing_status VARCHAR(32) NOT NULL,
  received_at DATETIME(3) NOT NULL,
  processed_at DATETIME(3) NULL,
  retry_count INT NOT NULL DEFAULT 0,
  failure_reason TEXT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_integration_event_logs_store_event (store_id, external_event_id),
  KEY idx_integration_event_logs_type_received_at (canonical_event_type, received_at),
  KEY idx_integration_event_logs_status_received_at (processing_status, received_at),
  KEY idx_integration_event_logs_source_entity (source_entity_type, source_entity_reference_id),
  CONSTRAINT fk_integration_event_logs_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS manual_resync_logs (
  id VARCHAR(64) NOT NULL,
  store_id VARCHAR(64) NOT NULL,
  target_entity_type VARCHAR(32) NOT NULL,
  target_external_reference_id VARCHAR(128) NOT NULL,
  requested_by_operator_id VARCHAR(64) NOT NULL,
  requested_at DATETIME(3) NOT NULL,
  result_status VARCHAR(32) NOT NULL,
  failure_reason TEXT NULL,
  PRIMARY KEY (id),
  KEY idx_manual_resync_logs_target (store_id, target_entity_type, target_external_reference_id, requested_at),
  KEY idx_manual_resync_logs_requester (requested_by_operator_id, requested_at),
  KEY idx_manual_resync_logs_result_status (result_status),
  CONSTRAINT fk_manual_resync_logs_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
