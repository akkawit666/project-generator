import { Sequelize } from 'sequelize';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';

// สร้าง __dirname ขึ้นมาใหม่สำหรับ ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const demoZipPath = path.join(__dirname, 'demo');

const typeMap = {
    integer: 'Integer',         // PostgreSQL
    int: 'Integer',             // MySQL, MSSQL
    bigint: 'Long',             // Suitable for large integer values
    smallint: 'Short',          // Smaller integers
    varchar: 'String',          // Variable-length string
    nvarchar: 'String',         // Unicode variable-length string (MSSQL)
    text: 'String',             // Text fields
    boolean: 'Boolean',         // Boolean values
    date: 'LocalDate',          // SQL DATE to java.time.LocalDate
    datetime: 'LocalDateTime',  // SQL DATETIME to java.time.LocalDateTime
    timestamp: 'Instant',       // SQL TIMESTAMP to java.time.Instant
    double: 'Double',           // Floating-point numbers
    float: 'Float',             // Single-precision floating-point numbers
    numeric: 'BigDecimal',      // Arbitrary precision numbers
    decimal: 'BigDecimal',      // Alias for numeric
    json: 'String',             // JSON usually serialized/deserialized as a String
    char: 'String',             // Single character or fixed-length string
    blob: 'byte[]',             // Binary large object
    clob: 'String',             // Character large object, treated as a String
    uuid: 'UUID',               // Universally Unique Identifier
};

// ฟังก์ชันสำหรับการแปลงชื่อไฟล์ให้เป็น CamelCase หลัง "_"
const toCamelCase = (str) => {
    return str
        .split('_')
        .map((word, index) => index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
};

// ฟังก์ชันสำหรับแปลงฟิลด์ให้เป็น CamelCase และตัวอักษรแรกเป็นตัวพิมพ์เล็ก
const toCamelCaseField = (str) => {
    const camelCase = str.split('_')
        .map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
    return camelCase;
};

(async function () {
    const answers = await inquirer.prompt([
        { name: 'dbType', type: 'list', choices: ['mysql', 'postgresql', 'oracle', 'sqlserver'], message: 'Database type:' },
        { name: 'host', type: 'input', message: 'Database host:' },
        { name: 'port', type: 'input', message: 'Database port (default: depends on database type):', default: (answers) => {
            switch (answers.dbType) {
                case 'mysql': return 3306;
                case 'postgresql': return 5432;
                case 'oracle': return 1521;
            }
        }},
        { name: 'username', type: 'input', message: 'Database username:' },
        { name: 'password', type: 'input', message: 'Database password:' },
        { name: 'databaseName', type: 'input', message: 'Database name (or Service Name for Oracle):' },
        { name: 'sid', type: 'input', message: 'Oracle SID (leave blank if using Service Name):', when: (answers) => answers.dbType === 'oracle' },
        {
            name: 'packageName',
            type: 'input',
            message: 'Java package name (e.g., com.example.project):',
            suffix: ' (This should follow the convention of reversed domain names, e.g., com.example.project)',
            default: 'com.example.project'
        },
        {
            name: 'groupId',
            type: 'input',
            message: 'Group ID:',
            suffix: ' (Represents the group or organization, e.g., com.example)',
            default: 'com.example'
        },
        {
            name: 'artifactId',
            type: 'input',
            message: 'Artifact ID:',
            suffix: ' (Represents the project name, usually written in lowercase)',
            default: 'myproject'
        },
        {
            name: 'outputDir',
            type: 'input',
            message: 'Output directory (default: ./output):',
            default: './output/example'
        },
    ]);

    // สร้าง connection string ตามฐานข้อมูลที่เลือก
    let connectionString = '';
    if (answers.dbType === 'mysql') {
        connectionString = `mysql://${answers.username}:${answers.password}@${answers.host}:${answers.port}/${answers.databaseName}`;
    } else if (answers.dbType === 'postgresql') {
        connectionString = `postgres://${answers.username}:${answers.password}@${answers.host}:${answers.port}/${answers.databaseName}`;
    } else if (answers.dbType === 'oracle') {
        if (answers.sid) {
            connectionString = `oracle://${answers.username}:${answers.password}@${answers.host}:${answers.port}/${answers.sid}`;
        } else {
            connectionString = `oracle://${answers.username}:${answers.password}@${answers.host}:${answers.port}/${answers.databaseName}`;
        }
    } else if (answers.dbType === 'sqlserver') {
        connectionString = `mssql://${answers.username}:${answers.password}@${answers.host}:${answers.port}/${answers.databaseName}`;
    }

    const sequelize = new Sequelize(connectionString, {
        dialect: 
            answers.dbType === 'mysql' ? 'mysql' :
            answers.dbType === 'postgresql' ? 'postgres' :
            answers.dbType === 'oracle' ? 'oracle' :
            answers.dbType === 'sqlserver' ? 'mssql' :
            undefined,
    });
    const outputDir = path.resolve(answers.outputDir, 'src', 'main', 'java');
    const packageDir = path.join(outputDir, ...answers.packageName.split('.'));

    try {
        await sequelize.authenticate();
        console.log('Connected to database!');

        // ดึงรายการตารางทั้งหมด
        const tables = await sequelize.getQueryInterface().showAllTables();

        // ให้ผู้ใช้เลือกตารางที่ต้องการ
        const tableAnswers = await inquirer.prompt([
            { name: 'selectedTables', type: 'checkbox', choices: tables, message: 'Select tables to generate code for:' }
        ]);
        const selectedTables = tableAnswers.selectedTables;

        for (const table of selectedTables) {
            const columns = await sequelize.getQueryInterface().describeTable(table);

            const fields = Object.entries(columns).map(([columnName, columnDef]) => {
                const sqlType = (columnDef.type || '').toLowerCase().split('(')[0];
                const javaType = typeMap[sqlType] || 'Object'; // Fallback to 'Object' if type is unmapped
                if (!typeMap[sqlType]) {
                    console.warn(`Unmapped SQL type: ${sqlType}`); // Log unmapped types for debugging
                }
                // column and field names must not has space or blank inside string
                
                return {
                    columnName,
                    fieldName: toCamelCaseField(columnName),
                    javaType,
                    isPrimaryKey: columnDef.primaryKey || false,
                    isAutoIncrement: columnDef.autoIncrement || false,
                };
            });
            
            // Add a fallback primary key if none is specified
            if (!fields.some(f => f.isPrimaryKey) && fields.length > 0) {
                fields[0].isPrimaryKey = true;
            }

            const modelName = toCamelCase(table);

            // must be String or Long or Integer
            let keyType = fields.find(f => f.isPrimaryKey)?.javaType || 'Long';
            if (keyType !== 'String' && keyType !== 'Long' && keyType !== 'int') {
                keyType = 'Integer';
            }

            // Render templates
            const templates = ['Model', 'Repository', 'Service', 'ServiceInterface', 'Controller'];
            for (const template of templates) {
                let dir, fileName, className;
                if (template === 'ServiceInterface') {
                    dir = path.join(packageDir, 'services');
                    fileName = `I${modelName}Service.java`;
                    className = `I${modelName}Service`;
                } else if (template === 'Service') {
                    dir = path.join(packageDir, 'services', 'impl');
                    fileName = `${modelName}Service.java`;
                    className = `${modelName}Service`;
                }
                else if (template === 'Repository') {
                    dir = path.join(packageDir, 'repositories');
                    fileName = `I${modelName}Repository.java`;
                    className = `I${modelName}`;
                }
                else if (template === 'Model') {
                    dir = path.join(packageDir, 'models');
                    fileName = `${modelName}.java`;
                    className = modelName;
                } 
                else {
                    dir = path.join(packageDir, `${template.toLowerCase()}s`);
                    fileName = `${modelName}${template}.java`;
                    className = `${modelName}${template}`;
                }
                const content = await ejs.renderFile(
                    path.join(__dirname, 'templates', `${template}.ejs`),
                    { packageName: answers.packageName, modelName, fields, className, tableName: table, keyType }
                );
                await fs.ensureDir(dir);
                await fs.writeFile(path.join(dir, fileName), content);
            }
        }

        // สร้างไฟล์ pom.xml
        const pomContent = await ejs.renderFile(
            path.join(__dirname, 'templates', 'pom.ejs'),
            { groupId: answers.groupId, artifactId: answers.artifactId, dbType: answers.dbType }
        );
        await fs.writeFile(path.join(outputDir, '..', '..', '..', 'pom.xml'), pomContent);

        // สร้างไฟล์ Application.java
        const appContent = await ejs.renderFile(
            path.join(__dirname, 'templates', 'Application.ejs'),
            { packageName: answers.packageName }
        );
        await fs.ensureDir(packageDir);
        await fs.writeFile(path.join(packageDir, 'Application.java'), appContent);

        // สร้างไฟล์ application.yml ใน src/main/resources
        const resourcesDir = path.resolve(answers.outputDir, 'src', 'main', 'resources');
        await fs.ensureDir(resourcesDir);
        const ymlContent = `
server:
  port: 8080

spring:
  datasource:
    url: jdbc:${answers.dbType}://${answers.host}:${answers.port}/${answers.databaseName}
    username: ${answers.username}
    password: ${answers.password}
    driver-class-name: ${answers.dbType === 'mysql' ? 'com.mysql.cj.jdbc.Driver' : answers.dbType === 'postgresql' ? 'org.postgresql.Driver' : 'oracle.jdbc.OracleDriver'}

  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: ${answers.dbType === 'mysql' ? 'org.hibernate.dialect.MySQLDialect' : answers.dbType === 'postgresql' ? 'org.hibernate.dialect.PostgreSQLDialect' : 'org.hibernate.dialect.OracleDialect'}
`;
        await fs.writeFile(path.join(resourcesDir, 'application.yml'), ymlContent);


        (async function () {
            try {
                
                const rootDir = path.resolve(answers.outputDir);

                await fs.copy(path.join(demoZipPath, '.gitignore'), path.join(rootDir, '.gitignore'));
                await fs.copy(path.join(demoZipPath, '.gitattributes'), path.join(rootDir, '.gitattributes'));
                await fs.copy(path.join(demoZipPath, 'mvnw'), path.join(rootDir, 'mvnw'));
                await fs.copy(path.join(demoZipPath, 'mvnw.cmd'), path.join(rootDir, 'mvnw.cmd'));
                await fs.copy(path.join(demoZipPath, '.mvn'), path.join(rootDir, '.mvn'));
                await fs.copy(path.join(demoZipPath, 'HELP.md'), path.join(rootDir, 'HELP.md'));

        
                console.log('Additional Spring Boot template files copied successfully!');
            } catch (err) {
                console.error('Error copying additional template files:', err);
            }
        })();

        console.log('Spring Boot project generated successfully!');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
})();
