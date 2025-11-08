// AWS Configuration
// This file will be generated during deployment
window.AWS_CONFIG = {
  apiUrl: '',
  cognitoUserPoolId: '',
  cognitoClientId: '',
  region: 'us-east-1',
  stripePublishableKey: 'pk_test_51234567890abcdefghijklmnop', // Replace with actual Stripe publishable key
  
  // Stripe Price IDs for different plans
  stripePrices: {
    monthly: 'price_1234567890monthly', // Replace with actual monthly price ID
    yearly: 'price_1234567890yearly',   // Replace with actual yearly price ID
    lifetime: 'price_1234567890lifetime' // Replace with actual lifetime price ID
  }
};
