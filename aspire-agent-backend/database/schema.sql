CREATE DATABASE IF NOT EXISTS aspire_agent
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE aspire_agent;

CREATE TABLE IF NOT EXISTS company_roles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(180) NOT NULL,
  role_title VARCHAR(180) NOT NULL,
  required_skills JSON NOT NULL,
  min_cgpa DECIMAL(3,2) NULL COMMENT 'NULL means not verified; never assume eligible',
  degree_eligibility JSON NULL COMMENT 'NULL means not verified',
  min_graduation_year SMALLINT NULL,
  max_graduation_year SMALLINT NULL,
  location VARCHAR(180) NULL,
  official_careers_url VARCHAR(600) NULL,
  source_url VARCHAR(600) NULL COMMENT 'URL where this specific requirement was verified',
  verified_at DATE NULL COMMENT 'Date the role/eligibility information was checked',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_company_role (company_name, role_title),
  KEY idx_active (active)
);

CREATE TABLE IF NOT EXISTS agent_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  conversation_id CHAR(36) NOT NULL,
  role ENUM('user','assistant') NOT NULL,
  content MEDIUMTEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_conversation (conversation_id, id)
);

-- These are illustrative company-role skill profiles, not current vacancies.
-- CGPA/degree/graduation eligibility remains NULL until verified by your placement cell
-- or an official recruitment source.
INSERT INTO company_roles
(company_name, role_title, required_skills, location, official_careers_url)
VALUES
('Bosch', 'Embedded Software Engineer', JSON_ARRAY('C', 'Embedded C', 'Microcontrollers', 'RTOS', 'UART', 'SPI'), 'India', 'https://www.bosch.in/careers/'),
('Texas Instruments', 'Embedded Systems Engineer', JSON_ARRAY('C', 'C++', 'Microcontrollers', 'Digital Electronics', 'Embedded C'), 'India', 'https://careers.ti.com/'),
('Qualcomm', 'Firmware Engineer', JSON_ARRAY('C', 'C++', 'Embedded C', 'Operating Systems', 'Debugging', 'Data Structures'), 'India', 'https://www.qualcomm.com/company/careers'),
('Infineon Technologies', 'Embedded Firmware Engineer', JSON_ARRAY('C', 'Embedded C', 'Microcontrollers', 'SPI', 'I2C', 'RTOS'), 'India', 'https://www.infineon.com/careers'),
('Tata Elxsi', 'Embedded Software Engineer', JSON_ARRAY('C', 'C++', 'Embedded Systems', 'Linux', 'Debugging'), 'India', 'https://www.tataelxsi.com/careers'),
('HCLTech', 'Embedded Engineer', JSON_ARRAY('C', 'C++', 'Embedded C', 'Microcontrollers', 'UART', 'Debugging'), 'India', 'https://www.hcltech.com/careers'),
('L&T Technology Services', 'Embedded Systems Engineer', JSON_ARRAY('C', 'Embedded C', 'Microcontrollers', 'Digital Electronics', 'Testing'), 'India', 'https://www.ltts.com/careers'),
('NXP Semiconductors', 'Firmware Engineer', JSON_ARRAY('C', 'Embedded C', 'Microcontrollers', 'RTOS', 'SPI', 'I2C'), 'India', 'https://www.nxp.com/company/about-nxp/careers:CAREERS'),
('Aptiv', 'Embedded Software Engineer', JSON_ARRAY('C', 'C++', 'Embedded Systems', 'CAN', 'Debugging'), 'India', 'https://www.aptiv.com/en/careers'),
('Continental', 'Embedded Software Engineer', JSON_ARRAY('C', 'C++', 'Embedded C', 'Automotive Systems', 'CAN'), 'India', 'https://www.continental.com/en/career/'),
('Siemens', 'Firmware / Embedded Engineer', JSON_ARRAY('C', 'C++', 'Microcontrollers', 'RTOS', 'Debugging'), 'India', 'https://www.siemens.com/global/en/company/jobs.html'),
('STMicroelectronics', 'Embedded Software Engineer', JSON_ARRAY('C', 'Embedded C', 'STM32', 'Microcontrollers', 'SPI', 'I2C'), 'India', 'https://www.st.com/content/st_com/en/about/careers.html')
ON DUPLICATE KEY UPDATE
  required_skills = VALUES(required_skills),
  location = VALUES(location),
  official_careers_url = VALUES(official_careers_url);
