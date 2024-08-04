# SDAM RESTFull API for L1000 Data

The [L1000 project](https://www.broadinstitute.org/publications/broad158356), started by the the research group around Todd Golub at the Broadinstitute, contains **Transcriptomic Data**.  
The goal of this project is to provide a RESTFul API, which allows reading, writing, updating and deleting Data from the different **datamodels** created within this project.

## Structure

The project is structured into different parts:

1. Understanding the Data and create appropriate Tables using SQL (SQLite3)
2. Create corresponding classes for every datamodel using Javascript
3. Bind those classes and their corresponding functions to routes within an **express server**
4. Test each route using **Shell Script**
5. Handle **User Input** by creating a responsive Graphical user interface (GUI)

## SQL Tables
