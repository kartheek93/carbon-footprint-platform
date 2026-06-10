#!/bin/bash
# ============================================
# EcoTrace — Google Cloud Run Deployment Script
# ============================================

# ---- CONFIG: Update these values ----
PROJECT_ID="your-gcp-project-id"        # Your GCP Project ID
REGION="us-central1"                     # Cloud Run region
SERVICE_NAME="ecotrace-app"              # Cloud Run service name
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"
MISTRAL_API_KEY="your_mistral_key_here"  # Your Mistral API key
# -------------------------------------

echo "🌿 Deploying EcoTrace to Cloud Run..."

# Step 1 — Build Docker image
echo "📦 Building Docker image..."
docker build \
  --build-arg VITE_MISTRAL_API_KEY=$MISTRAL_API_KEY \
  -t $IMAGE_NAME .

# Step 2 — Push to Google Container Registry
echo "⬆️  Pushing image to GCR..."
docker push $IMAGE_NAME

# Step 3 — Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars VITE_MISTRAL_API_KEY=$MISTRAL_API_KEY

echo "✅ Deployment complete!"
echo "🔗 Your app URL will be shown above"
