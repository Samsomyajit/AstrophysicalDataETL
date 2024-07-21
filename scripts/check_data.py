from sqlalchemy import create_engine
import pandas as pd
import os

db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app', 'astrophysics.db'))
db_uri = f'sqlite:///{db_path}'
engine = create_engine(db_uri)

df = pd.read_sql('astrophysical_data', engine)
print(df.head())
