
# ตัวสร้างโค้ดสำหรับ Spring Boot

โปรแกรมสร้างโค้ดสำหรับการสร้างโปรเจกต์ Spring Boot ที่รองรับ Java 17 และการเชื่อมต่อฐานข้อมูล MySQL
ช่วยให้การตั้งค่าโปรเจกต์ Spring Boot ง่ายขึ้นโดยการสร้าง Models, Repositories, Services, Controllers 
และส่วนประกอบที่สำคัญอื่น ๆ โดยอัตโนมัติ

## คุณสมบัติ

- สร้างโค้ดสำหรับ Java Spring Boot ที่รองรับ **Java 17**
- สนับสนุนฐานข้อมูล **MySQL** ในปัจจุบัน (ฐานข้อมูลอื่น ๆ จะถูกเพิ่มในอนาคต)
- สร้างไฟล์ `pom.xml`, `application.yml` และโครงสร้างพื้นฐานของ Spring Boot
- สร้างโค้ดสำหรับตารางที่เลือกจากฐานข้อมูล พร้อมแมปประเภทข้อมูลอัตโนมัติ
- รวมเทมเพลตสำหรับ Models, Repositories, Services และ Controllers
- เตรียมไฟล์เพิ่มเติม เช่น `.gitignore`, `mvnw` และ `HELP.md`

## ความต้องการ

ก่อนใช้งานโปรแกรมนี้ ตรวจสอบให้แน่ใจว่าคุณได้ติดตั้งสิ่งต่อไปนี้:

- **Node.js** (เวอร์ชัน 16 หรือใหม่กว่า)
- **Java 17**
- **MySQL** (ที่กำลังทำงานและเข้าถึงได้)
- **Maven**

## การติดตั้ง

โคลนโปรเจกต์นี้ไปยังเครื่องของคุณ:

```bash
git clone https://github.com/your-username/spring-boot-code-generator.git
cd spring-boot-code-generator
```

ติดตั้ง dependencies ที่จำเป็น:

```bash
npm install
```

## การใช้งาน

เรียกใช้โปรแกรมสร้างโค้ดด้วยคำสั่งต่อไปนี้:

```bash
node index.js
```

### การตั้งค่า

CLI จะสอบถามข้อมูลดังนี้:

1. **ประเภทฐานข้อมูล**: ปัจจุบันรองรับ `mysql` (ฐานข้อมูลอื่น ๆ จะถูกเพิ่มในอนาคต)
2. **รายละเอียดการเชื่อมต่อฐานข้อมูล**: Host, Port, Username, Password, ชื่อฐานข้อมูล
3. **ชื่อแพ็กเกจ Java**: ใช้รูปแบบ reversed domain เช่น `com.example.project`
4. **Group ID และ Artifact ID**: สำหรับการตั้งค่า Maven
5. **ไดเรกทอรีสำหรับเอาต์พุต**: ไดเรกทอรีที่ต้องการบันทึกโปรเจกต์ที่สร้างขึ้น

### โครงสร้างเอาต์พุต

โปรเจกต์ที่สร้างขึ้นจะมีโครงสร้างดังนี้:

```plaintext
output/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/project/
│   │   │       ├── Application.java
│   │   │       ├── controllers/
│   │   │       ├── models/
│   │   │       ├── repositories/
│   │   │       └── services/
│   │   │           └── impl/
│   │   ├── resources/
│   │   │   ├── application.yml
│   │   │   └── ...
├── pom.xml
├── .gitignore
└── mvnw
```

## ตัวอย่าง

ตัวอย่างการตั้งค่าโปรแกรม:

```yaml
ประเภทฐานข้อมูล: mysql
Host: localhost
Port: 3306
Username: root
Password: password
ชื่อฐานข้อมูล: example_db
ชื่อแพ็กเกจ Java: com.example.project
Group ID: com.example
Artifact ID: myproject
ไดเรกทอรีสำหรับเอาต์พุต: ./output/example
```

หลังจากเลือกตาราง โปรแกรมจะสร้างคลาส Java สำหรับตารางที่เลือก เช่น สำหรับตารางชื่อ `user` จะสร้าง:

- `User.java` ใน `models`
- `IUserRepository.java` ใน `repositories`
- `UserService.java` และ `IUserService.java` ใน `services`
- `UserController.java` ใน `controllers`

## การพัฒนาในอนาคต

แผนการปรับปรุง:

- เพิ่มการรองรับฐานข้อมูล PostgreSQL และ Oracle
- ขยายการแมปประเภทข้อมูลสำหรับประเภทคอลัมน์ขั้นสูง
- เพิ่มการสร้าง Unit Test สำหรับ Services และ Controllers
- เพิ่มการรองรับ Annotation และ Validation แบบกำหนดเอง
- เพิ่ม GUI เพื่อให้ใช้งานง่ายขึ้น

## การมีส่วนร่วม

ยินดีต้อนรับการมีส่วนร่วม! สามารถ Fork โปรเจกต์นี้และส่ง Pull Request ได้

## ใบอนุญาต

โปรเจกต์นี้ใช้ใบอนุญาต MIT ดูรายละเอียดได้ในไฟล์ `LICENSE`
