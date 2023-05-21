import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'House Hunt By Nikhil Nishad',
      version: '1.2.0',
      description: 'API documentation using Swagger',
    },
    servers: [
      {
        url: 'http://localhost:3001', // Replace with your server URL
      },
    ],
    components: {
      schemas: {
        User: {
          $ref: '#/components/schemas/User',
        },
      },
    },
  },
  apis: ['./src/routes/**/*.ts'], // Specify the path to your route files
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
