# Design specifications

Table of contents:

* [Introduction](#introduction)
* [Technologies](#technologies)
* [Architecture Styles, Architecture Pattern and Design Patterns](#architecture-styles-architecture-pattern-and-design-patterns)
* [4+1 Architectural View Model](#41-architectural-view-model)
	* [Logical View](#logical-view)
	* [Development View](#development-view)
	* [Process View](#process-view)
	* [Physical View](#physical-view)
	* [Scenarios](#scenarios)

## Introduction

This project enables real-time temperature monitoring and analysis through an integrated sensor-to-web pipeline.

## Technologies

Our project implements a full pipeline for real-time temperature monitoring. A Raspberry Pi reads data from a temperature sensor and transmits it via MQTT using a Mosquitto broker. A Python subscriber receives the messages and stores the readings in MongoDB. The Node.js backend queries the database, optionally getting enriched feedback from the LLM through the MCP, and exposes them through an API. Finally, a Vue.js frontend consumes this API and presents the sensor data in an accessible interface for end users.

![Big picture](design/design_specifications/image-1.png)

## Architecture Styles, Architecture Pattern and Design Patterns

The project makes use of the following architecture styles and architecture patterns and design patterns:

**Architecture Styles:**

*Client-Server* - Client-Server style is reflected in the interaction between the client PC and its services: the Vue.js frontend acts as a client requesting data and services from the Node.js backend, Python server, MongoDB database, and optional LLM, which serve responses over REST APIs. 

*Publish-Subscribe* - The Publish-Subscribe style is used for communication with the Raspberry Pi: the sensors publish data to the MQTT broker, and any interested services (subscribers) on the client side receive these updates asynchronously, allowing decoupled and real-time interactions.

*N-Tiers* – The N-Tiers architectural style is reflected in the separation of the system into distinct layers. The project separates the presentation, application, and data layers, ensuring clear boundaries between user interface, business logic, and data management. This structure improves maintainability, scalability, and flexibility by allowing each tier to evolve or be deployed independently.

**Architecture Patterns:**

*Service-Oriented Architecture (SOA)* - SOA is reflected in our project by the clear separation of responsibilities across independently deployable services. Everything communicates by well-defined interfaces, such as MQTT and REST APIs. This modular approach enhances scalability, maintainability, and flexibility, as each service can evolve or scale independently.

*3-Tier Architecture* – The 3-Tier architectural pattern is reflected in the separation between the presentation, application, and data tiers. The Vue.js frontend represents the presentation tier, responsible for user interaction. The Node.js and Python backend services form the application tier, where business logic and data processing take place. The MongoDB database and MQTT broker make up the data tier, handling data persistence and message distribution. The embedded system (Raspberry Pi) acts as an external data source connected to the application tier through the MQTT broker, extending the 3-tier structure with a physical sensing component.

*Web Request Architecture* – The Web Request architectural pattern is reflected in the interaction between the client and backend services through HTTP-based REST APIs. The Vue.js frontend sends web requests to the Node.js server to retrieve or submit data. These requests are processed by defined endpoints that handle validation, business logic, and data access before returning structured JSON responses. This request–response mechanism ensures stateless communication, clear data flow, and interoperability between distributed components.

**Design Patterns:**

*Singleton Pattern* – Applied in the Python service to handle the MongoDB connection. By ensuring that only one database client instance exists, the application avoids redundant connections and ensures efficient resource management.

*Factory Pattern* – Used for creating MQTT clients in a consistent and centralized way. The factory encapsulates configuration details such as broker address, topics, and quality of service, making it easy to extend the system with additional MQTT clients in the future without changing the client creation logic across the codebase.

## 4+1 architectural view model

The 4+1 architectural view model organizes the system’s design into complementary perspectives to address different stakeholder concerns.

![Kruchten 4 + 1 diagram](design/design_specifications/image.png)

### Logical view

This section will be filled in the future.

### Development view

The following diagram shows how the different components interact with each other.

![Component diagram](design/design_specifications/image-3.png)

### Process view

![Activity diagram](design/design_specifications/image-2.png)

The Raspberry Pi continuously collects temperature readings and publishes them to the Mosquitto MQTT broker. A Python service subscribes to the relevant MQTT topic, extracts the temperature values, and stores them in MongoDB. The Node.js backend retrieves this data and communicates with the Model Context Protocol (MCP) layer when enrichment or LLM-driven processing is required. The MCP layer serves as a standardized interface between the backend and the LLM, handling context exchange and tool access. The enriched results are then exposed via a REST API. Finally, the Vue.js frontend requests data from the backend API and displays the temperature information to the end user. This process flow demonstrates the asynchronous data pipeline and the concurrency between data acquisition, storage, processing, and presentation, with the MCP layer enabling dynamic LLM interaction in a modular and secure manner.

### Physical view

The following deployment diagram shows the system’s physical setup, consisting of a client PC and a Raspberry Pi connected via MQTT. On the client PC, Docker containers run the Vue.js frontend, Node.js backend, Python server, LLM, MongoDB database, and MQTT broker, communicating mainly through REST APIs. The Raspberry Pi runs an MQTT client and sensors, interacting with the system through the broker to exchange data.

![Deployment diagram](design/design_specifications/DeploymentDiagram.drawio.png)

### Scenarios

The use case diagram focuses on how the user interacts with the system across two main scenarios. In the first, the user monitors real-time sensor data that is collected by the Raspberry Pi, stored in the backend, and visualized in the frontend. This enables users to easily access and interpret environmental information through a clear and responsive interface. In the second scenario, the user requests deeper insights based on this data, triggering an interaction with the integrated LLM service, which analyzes trends and returns contextual explanations. Together, the two use cases illustrate how the system supports both straightforward data visualization and intelligent, user-driven analysis built on live sensor input.

![Use Case Diagram](design/design_specifications/Use_case_diagram.png)