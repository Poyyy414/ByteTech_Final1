-- ByteTech database schema (MySQL 8)
-- Derived from the queries in controllers/*.js

CREATE TABLE IF NOT EXISTS barangay (
    barangay_id    INT AUTO_INCREMENT PRIMARY KEY,
    barangay_name  VARCHAR(100) NOT NULL,
    city           VARCHAR(100),
    latitude       DECIMAL(10, 7),
    longitude      DECIMAL(10, 7),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS establishment (
    establishment_id    INT AUTO_INCREMENT PRIMARY KEY,
    establishment_name  VARCHAR(150) NOT NULL,
    establishment_type  VARCHAR(100),
    barangay_id         INT NOT NULL,
    latitude            DECIMAL(10, 7),
    longitude           DECIMAL(10, 7),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_establishment_barangay
        FOREIGN KEY (barangay_id) REFERENCES barangay (barangay_id)
);

CREATE TABLE IF NOT EXISTS sensor (
    sensor_id         INT AUTO_INCREMENT PRIMARY KEY,
    sensor_name       VARCHAR(100) NOT NULL,
    barangay_id       INT NOT NULL,
    establishment_id  INT NULL,
    installed_on      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sensor_barangay
        FOREIGN KEY (barangay_id) REFERENCES barangay (barangay_id),
    CONSTRAINT fk_sensor_establishment
        FOREIGN KEY (establishment_id) REFERENCES establishment (establishment_id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sensor_data (
    data_id        INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id      INT NOT NULL,
    co2_density    DECIMAL(10, 2) NOT NULL,
    temperature_c  DECIMAL(5, 2)  NOT NULL,
    humidity       DECIMAL(5, 2)  NOT NULL,
    heat_index_c   DECIMAL(5, 2)  NOT NULL,
    carbon_level   VARCHAR(50)    NOT NULL,
    minute_stamp   DATETIME       NOT NULL,
    recorded_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- one reading per sensor per minute (controller returns 409 on duplicate)
    UNIQUE KEY uq_sensor_minute (sensor_id, minute_stamp),
    KEY idx_recorded_at (recorded_at),
    CONSTRAINT fk_sensor_data_sensor
        FOREIGN KEY (sensor_id) REFERENCES sensor (sensor_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    phone_number  VARCHAR(20)  NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: column is spelled "feeback_id" because the controller queries it that way
CREATE TABLE IF NOT EXISTS feedback (
    feeback_id     INT AUTO_INCREMENT PRIMARY KEY,
    feedback_name  VARCHAR(100),
    category       ENUM('Report a Bug', 'Improvement', 'General Feedback', 'Others'),
    rating         TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    message        TEXT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspections (
    inspection_id     INT AUTO_INCREMENT PRIMARY KEY,
    establishment_id  INT,
    status            VARCHAR(20) NOT NULL, -- e.g. 'PASSED', 'FAILED'
    inspection_date   DATE NOT NULL,
    remarks           TEXT,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inspection_establishment
        FOREIGN KEY (establishment_id) REFERENCES establishment (establishment_id)
        ON DELETE SET NULL
);
