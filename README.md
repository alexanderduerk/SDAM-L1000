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
  - [Cells](#cells)
  - [Genes](#genes)
  - [Perturbations](#perturbations)
- [Usage](#usage)
  - [Example Requests](#example-requests)
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

sql
Code kopieren
-- Example schema for the cells table
CREATE TABLE cells (
cell_id TEXT PRIMARY KEY,
cell_name TEXT,
organism TEXT,
tissue TEXT,
cell_type TEXT
);

-- Similar schemas would be required for `genes` and `perturbations` tables
Running the API
To start the API server, run the following command:

bash
Code kopieren
node app.js
The server will start on http://localhost:3000.

API Endpoints
Cells
Create a new cell record

POST /cells
Request Body: JSON containing cell_id, cell_name, organism, tissue, and cell_type.
Search cell records

POST /cells/search
Request Body: JSON with search parameters (e.g., field, op, val, limit, offset, orderfield, descendants).
Update a cell record

PATCH /cells
Request Body: JSON containing cell_id, columnname, and newvalue.
Delete a cell record

DELETE /cells/:name
URL Parameter: name (the identifier for the cell to be deleted).
Genes
Create a new gene record

POST /genes
Request Body: JSON containing gene information fields.
Search gene records

POST /genes/search
Request Body: JSON with search parameters.
Update a gene record

PATCH /genes
Request Body: JSON containing gene_id, columnname, and newvalue.
Delete a gene record

DELETE /genes/:id
URL Parameter: id (the identifier for the gene to be deleted).
Perturbations
Create a new perturbation record

POST /perturbations
Request Body: JSON containing perturbation information fields.
Search perturbation records

POST /perturbations/search
Request Body: JSON with search parameters.
Update a perturbation record

PATCH /perturbations
Request Body: JSON containing pert_id, columnname, and newvalue.
Delete a perturbation record

DELETE /perturbations/:id
URL Parameter: id (the identifier for the perturbation to be deleted).
Usage
Example Requests
Below are some example curl commands to interact with the API:

Create a new cell

bash
Code kopieren
curl -X POST http://localhost:3000/cells -H "Content-Type: application/json" -d '{"cell_id":"C123", "cell_name":"A549", "organism":"Human", "tissue":"Lung", "cell_type":"Carcinoma"}'
Search for cells

bash
Code kopieren
curl -X POST http://localhost:3000/cells/search -H "Content-Type: application/json" -d '{"field":"cell_name", "op":"LIKE", "val":"A%", "limit":10}'
Update a cell record

bash
Code kopieren
curl -X PATCH http://localhost:3000/cells -H "Content-Type: application/json" -d '{"cell_id":"C123", "columnname":"cell_type", "newvalue":"Epithelial"}'
Delete a cell

bash
Code kopieren
curl -X DELETE http://localhost:3000/cells/C123
License
This project is licensed under the MIT License. See the LICENSE file for details.
