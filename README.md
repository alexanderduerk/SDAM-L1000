# L1000 Dataset RESTful API

This repository contains a RESTful API built on Node.js using the Express framework. The API is designed to interact with the L1000 dataset from the Broad Institute, which includes data related to cells, genes, and perturbations. The API allows for creating, reading, updating, and deleting (CRUD) operations on these datasets, as well as advanced search capabilities.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running the API](#running-the-api)
- [API Endpoints](#api-endpoints)
- [GUI-Guide](#gui-guide)
- [License](#license)

## Overview

The L1000 dataset API provides programmatic access to the data tables related to cell information, gene information, and perturbations. Users can perform CRUD operations and complex searches via a RESTful interface. This API is useful for bioinformatics research, data analysis, and integrating L1000 data into larger projects.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js (v12.x or later)
- npm (Node package manager)
- SQLite3 (for database management)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/your-repo/l1000-api.git
   cd l1000-api
   ```
2. Install the required Node.js packages:
   ```bash
   npm install
   ```

### Database Setup

The API interacts with an SQLite database named l1000.db. Ensure this database is correctly set up and contains the necessary tables. For this you can run the delivered [SQL-File](l1000.sql).

### Running the API

To start the API server, run the following command:

```bash
node app.js
```

The server will start on http://localhost:3000.

## API Endpoints

### Cells

#### Create a new cell record

```bash
TODO
```

#### Search cell records

Can be done either by searching for an ID or with a more complex searchArg allowing for descendants as well.

```bash
SearchById
```

```bash
Search with Desc
```

#### Update cell records

Request Body: JSON containing cell_id, columnname and newvalue. Uses Set to update a value within the SQL database.

```bash
UPDATE
```

#### Delete a cell record

URL Parameter within the route: /cells/:name

```bash
DELETE
```

# GUI-Guide

Our GUI allows a user friendly experience looking for Data within L1000 data. Therefore three different search fields are given, to search the database for a used cell, compound or targeted gene. The rendered table can be further customized. Using the buttons within the header column would allow for changing between Ascending and Descending order for the given column. Hovering over the i's will show more information for the data within the column. The search fields will allow to further adjust the searchArg. For the text based columns the operator will be set to contains for every text searched for. The value based columns allow for >, <, <= and >=. Those descendants need to be used after each other with each step needing a confirmation by clicking Search or using enter. At the bottom of the page the limit can be changed as well as the Page/Offset. The Show Full Table button at the top can be used to render the full information within the siginfo table without our prefiltering. The plot button will lead to a new page, which would contain two plots, which can be downloaded, as well as the corresponding data. For those plots the current searchArg is used with the current set limit.

# License

This project is licensed under the MIT License. See the LICENSE file for details.
