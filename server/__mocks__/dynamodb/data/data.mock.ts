const resultMock = {
  Items: [
    { id: "1", name: "Feature 1" },
    { id: "2", name: "Feature 2" },
  ],
  Count: 2,
  ScannedCount: 2,
  $metadata: {
    httpStatusCode: 200,
    requestId: "mockRequestId",
    extendedRequestId: "mockExtendedRequestId",
    cfId: "mockCfId",
    attempts: 1,
    totalRetryDelay: 0,
  },
};

const entitiesMock = [
  {
    name: "Feature 1",
    createdAt: "2024-09-01T00:00:00.000Z",
    email: "test1@example.com",
    PK: "PK1",
    SK: "SK1",
    updatedAt: "2024-09-01T00:00:00.000Z",
  },
  {
    name: "Feature 2",
    createdAt: "2024-09-01T01:00:00.000Z",
    email: "test2@example.com",
    PK: "PK1",
    SK: "SK1",
    updatedAt: "2024-09-01T01:00:00.000Z",
  },
];

export { resultMock, entitiesMock };
