SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS app_user (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    login_id VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    role ENUM('CUSTOMER', 'OPERATOR') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_app_user_login_id (login_id),
    UNIQUE KEY uk_app_user_email (email),
    KEY idx_app_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS store (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    owner_user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NULL,
    phone VARCHAR(30) NULL,
    address VARCHAR(255) NULL,
    business_hours VARCHAR(255) NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_store_owner_user_id (owner_user_id),
    KEY idx_store_category (category),
    CONSTRAINT fk_store_owner_app_user
        FOREIGN KEY (owner_user_id) REFERENCES app_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    store_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_product_store_id (store_id),
    KEY idx_product_name (name),
    CONSTRAINT fk_product_store
        FOREIGN KEY (store_id) REFERENCES store(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_table (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    store_id BIGINT UNSIGNED NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    order_status ENUM('PLACED', 'PAID', 'SHIPPING', 'DELIVERED', 'CANCELED') NOT NULL DEFAULT 'PLACED',
    ordered_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_order_number (order_number),
    KEY idx_order_user_id (user_id),
    KEY idx_order_store_id (store_id),
    KEY idx_order_status (order_status),
    KEY idx_order_ordered_at (ordered_at),
    CONSTRAINT fk_order_app_user
        FOREIGN KEY (user_id) REFERENCES app_user(id),
    CONSTRAINT fk_order_store
        FOREIGN KEY (store_id) REFERENCES store(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_item (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_order_item_order_id (order_id),
    KEY idx_order_item_product_id (product_id),
    CONSTRAINT fk_order_item_order
        FOREIGN KEY (order_id) REFERENCES order_table(id),
    CONSTRAINT fk_order_item_product
        FOREIGN KEY (product_id) REFERENCES product(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inquiry_post (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    store_id BIGINT UNSIGNED NOT NULL,
    author_user_id BIGINT UNSIGNED NOT NULL,
    order_id BIGINT UNSIGNED NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_secret BOOLEAN NOT NULL DEFAULT FALSE,
    inquiry_status ENUM('OPEN', 'ANSWERED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_inquiry_post_store_id (store_id),
    KEY idx_inquiry_post_author_user_id (author_user_id),
    KEY idx_inquiry_post_order_id (order_id),
    KEY idx_inquiry_post_status (inquiry_status),
    KEY idx_inquiry_post_created_at (created_at),
    CONSTRAINT fk_inquiry_post_store
        FOREIGN KEY (store_id) REFERENCES store(id),
    CONSTRAINT fk_inquiry_post_author_app_user
        FOREIGN KEY (author_user_id) REFERENCES app_user(id),
    CONSTRAINT fk_inquiry_post_order
        FOREIGN KEY (order_id) REFERENCES order_table(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inquiry_post_image (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    inquiry_post_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_inquiry_post_image_post_id (inquiry_post_id),
    CONSTRAINT fk_inquiry_post_image_post
        FOREIGN KEY (inquiry_post_id) REFERENCES inquiry_post(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inquiry_post_reply (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    inquiry_post_id BIGINT UNSIGNED NOT NULL,
    author_user_id BIGINT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_inquiry_post_reply_post_id (inquiry_post_id),
    KEY idx_inquiry_post_reply_author_user_id (author_user_id),
    CONSTRAINT fk_inquiry_post_reply_post
        FOREIGN KEY (inquiry_post_id) REFERENCES inquiry_post(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_inquiry_post_reply_author_app_user
        FOREIGN KEY (author_user_id) REFERENCES app_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS support_session (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    store_id BIGINT UNSIGNED NOT NULL,
    customer_user_id BIGINT UNSIGNED NOT NULL,
    operator_user_id BIGINT UNSIGNED NULL,
    order_id BIGINT UNSIGNED NULL,
    session_type ENUM('GENERAL', 'ORDER') NOT NULL DEFAULT 'GENERAL',
    support_status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'EXPIRED') NOT NULL DEFAULT 'OPEN',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME NULL,
    last_message_at DATETIME NULL,
    PRIMARY KEY (id),
    KEY idx_support_session_store_id (store_id),
    KEY idx_support_session_customer_user_id (customer_user_id),
    KEY idx_support_session_operator_user_id (operator_user_id),
    KEY idx_support_session_order_id (order_id),
    KEY idx_support_session_status (support_status),
    KEY idx_support_session_last_message_at (last_message_at),
    CONSTRAINT fk_support_session_store
        FOREIGN KEY (store_id) REFERENCES store(id),
    CONSTRAINT fk_support_session_customer_app_user
        FOREIGN KEY (customer_user_id) REFERENCES app_user(id),
    CONSTRAINT fk_support_session_operator_app_user
        FOREIGN KEY (operator_user_id) REFERENCES app_user(id),
    CONSTRAINT fk_support_session_order
        FOREIGN KEY (order_id) REFERENCES order_table(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS support_message (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    support_session_id BIGINT UNSIGNED NOT NULL,
    sender_user_id BIGINT UNSIGNED NULL,
    sender_type ENUM('CUSTOMER', 'OPERATOR', 'SYSTEM') NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_support_message_session_id (support_session_id),
    KEY idx_support_message_sender_user_id (sender_user_id),
    KEY idx_support_message_created_at (created_at),
    CONSTRAINT fk_support_message_session
        FOREIGN KEY (support_session_id) REFERENCES support_session(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_support_message_sender_app_user
        FOREIGN KEY (sender_user_id) REFERENCES app_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS support_message_image (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    support_message_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_support_message_image_message_id (support_message_id),
    CONSTRAINT fk_support_message_image_message
        FOREIGN KEY (support_message_id) REFERENCES support_message(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chatbot_session (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    store_id BIGINT UNSIGNED NOT NULL,
    customer_user_id BIGINT UNSIGNED NOT NULL,
    linked_support_session_id BIGINT UNSIGNED NULL,
    chatbot_status ENUM('ACTIVE', 'HANDED_OFF', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expired_at DATETIME NULL,
    PRIMARY KEY (id),
    KEY idx_chatbot_session_store_id (store_id),
    KEY idx_chatbot_session_customer_user_id (customer_user_id),
    KEY idx_chatbot_session_linked_support_session_id (linked_support_session_id),
    KEY idx_chatbot_session_status (chatbot_status),
    CONSTRAINT fk_chatbot_session_store
        FOREIGN KEY (store_id) REFERENCES store(id),
    CONSTRAINT fk_chatbot_session_customer_app_user
        FOREIGN KEY (customer_user_id) REFERENCES app_user(id),
    CONSTRAINT fk_chatbot_session_linked_support_session
        FOREIGN KEY (linked_support_session_id) REFERENCES support_session(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chatbot_message (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    chatbot_session_id BIGINT UNSIGNED NOT NULL,
    sender_type ENUM('CUSTOMER', 'BOT', 'SYSTEM') NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_chatbot_message_session_id (chatbot_session_id),
    KEY idx_chatbot_message_created_at (created_at),
    CONSTRAINT fk_chatbot_message_session
        FOREIGN KEY (chatbot_session_id) REFERENCES chatbot_session(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chatbot_message_image (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    chatbot_message_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_chatbot_message_image_message_id (chatbot_message_id),
    CONSTRAINT fk_chatbot_message_image_message
        FOREIGN KEY (chatbot_message_id) REFERENCES chatbot_message(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS faq (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    store_id BIGINT UNSIGNED NOT NULL,
    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_faq_store_id (store_id),
    KEY idx_faq_sort_order (sort_order),
    CONSTRAINT fk_faq_store
        FOREIGN KEY (store_id) REFERENCES store(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS response_preset (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    store_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_response_preset_store_id (store_id),
    CONSTRAINT fk_response_preset_store
        FOREIGN KEY (store_id) REFERENCES store(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chatbot_knowledge_file (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    store_id BIGINT UNSIGNED NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_chatbot_knowledge_file_store_id (store_id),
    KEY idx_chatbot_knowledge_file_active (is_active),
    CONSTRAINT fk_chatbot_knowledge_file_store
        FOREIGN KEY (store_id) REFERENCES store(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS store_stat_daily (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    store_id BIGINT UNSIGNED NOT NULL,
    stat_date DATE NOT NULL,
    inquiry_count INT UNSIGNED NOT NULL DEFAULT 0,
    support_count INT UNSIGNED NOT NULL DEFAULT 0,
    resolved_count INT UNSIGNED NOT NULL DEFAULT 0,
    first_response_avg_seconds INT UNSIGNED NOT NULL DEFAULT 0,
    chatbot_handoff_count INT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_store_stat_daily (store_id, stat_date),
    CONSTRAINT fk_store_stat_daily_store
        FOREIGN KEY (store_id) REFERENCES store(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS refresh_token (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(512) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at DATETIME NULL,
    PRIMARY KEY (id),
    KEY idx_refresh_token_user_id (user_id),
    KEY idx_refresh_token_expires_at (expires_at),
    CONSTRAINT fk_refresh_token_app_user
        FOREIGN KEY (user_id) REFERENCES app_user(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
