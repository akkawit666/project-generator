
# Spring Boot Code Generator

A code generator for creating Spring Boot projects with support for Java 17 and MySQL database integration. 
This tool simplifies the process of setting up Spring Boot projects by generating Models, Repositories, Services, 
Controllers, and other essential components automatically.

## Features

- Generates Java Spring Boot code compatible with **Java 17**.
- Supports **MySQL** database for now (other databases planned for future updates).
- Creates `pom.xml`, `application.yml`, and the basic Spring Boot structure.
- Generates code for selected database tables with automatic field type mapping.
- Includes templates for Models, Repositories, Services, and Controllers.
- Prepares additional Spring Boot files for ease of setup, such as `.gitignore`, `mvnw`, and `HELP.md`.

## Prerequisites

Before using this tool, ensure the following are installed:

- **Node.js** (v16 or later)
- **Java 17**
- **MySQL** (running and accessible)
- **Maven**

## Installation

Clone this repository to your local machine:

```bash
git clone https://github.com/your-username/spring-boot-code-generator.git
cd spring-boot-code-generator
```

Install the required dependencies:

```bash
npm install
```

## Usage

Run the generator using the following command:

```bash
node index.js
```

### Configuration

The CLI will prompt for the following inputs:

1. **Database type**: Currently supports `mysql` (others will be added later).
2. **Database connection details**: Host, port, username, password, database name.
3. **Java package name**: Follows the reversed domain naming convention, e.g., `com.example.project`.
4. **Group ID and Artifact ID**: For Maven configuration.
5. **Output directory**: Directory where the generated project will be saved.

### Output Structure

The generated project will include:

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

## Example

Here’s an example of how you might configure the tool:

```yaml
Database type: mysql
Host: localhost
Port: 3306
Username: root
Password: password
Database name: example_db
Java package name: com.example.project
Group ID: com.example
Artifact ID: myproject
Output directory: ./output/example
```

After selecting tables, the tool generates Java classes for the chosen database tables. For instance, for a table named `user`, it will generate:

- `User.java` in `models`
- `IUserRepository.java` in `repositories`
- `UserService.java` and `IUserService.java` in `services`
- `UserController.java` in `controllers`

## Future Development

Planned enhancements:

- Add support for PostgreSQL and Oracle databases.
- Extend type mappings for advanced column types.
- Include unit test generation for services and controllers.
- Add support for custom annotations and validations.
- GUI version for better usability.

## Contribution

Contributions are welcome! Feel free to fork this repository and submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
