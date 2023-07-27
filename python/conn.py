import mysql.connector

def create_conn():
    conn = mysql.connector.connect(
        host="localhost",
        port="3306",
        user="potty",
        password="p@ss",
        database="streaming_test"
    )
    return conn