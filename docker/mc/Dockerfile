FROM minio/mc:latest
WORKDIR /app

COPY create-bucket.sh /usr/local/bin/create-bucket.sh
RUN chmod +x /usr/local/bin/create-bucket.sh

ENTRYPOINT ["/usr/local/bin/create-bucket.sh"]