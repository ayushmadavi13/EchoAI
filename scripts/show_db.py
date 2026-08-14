from qdrant_client import QdrantClient

def main():
    try:
        client = QdrantClient(path='qdrant_data')
        
        # Check if collection exists
        if not client.collection_exists('msmarco_chunks'):
            print("Error: The collection 'msmarco_chunks' does not exist. Did setup_db.py finish running?")
            return

        records = client.scroll(collection_name='msmarco_chunks', limit=5)[0]
        
        if not records:
            print("The database exists, but it is empty! You need to let setup_db.py run for at least a few seconds to insert data.")
            return

        print("\n--- Here is what is inside your database ---")
        for i, r in enumerate(records):
            print(f"\n[Chunk {i+1}]")
            print(f"Metadata Query: {r.payload.get('source_query', 'N/A')}")
            # Print the first 100 characters of the text context
            print(f"Context Text: {r.payload.get('text', 'N/A')[:100]}...")

    finally:
        # Explicitly close the client to avoid Windows teardown lock errors
        client.close()

if __name__ == "__main__":
    main()
