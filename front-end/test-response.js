// Test to see the actual response structure
const response = {
  code: 9999, 
  data: {
    access_token: "token123",
    refresh_token: "refresh123"
  }, 
  message: 'Operation succeeded'
};

console.log('response.data:', response.data);
console.log('response.data.access_token:', response.data.access_token);
console.log('response.data.refresh_token:', response.data.refresh_token);
