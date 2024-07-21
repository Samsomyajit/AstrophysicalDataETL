from sqlalchemy import create_engine
import pandas as pd
import os

def load_data(file_path, db_uri):
    engine = create_engine(db_uri)
    df = pd.read_csv(file_path)
    df.to_sql('astrophysical_data', engine, if_exists='replace', index=False)

# Get the absolute path of the database file
db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app', 'astrophysics.db'))
db_uri = f'sqlite:///{db_path}'

load_data('data/astrophysical_data_cleaned.csv', db_uri)
print("Data loading completed")
