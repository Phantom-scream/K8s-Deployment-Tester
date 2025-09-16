const { parseYAML } = require("../parser");

describe("parseYAML", () => {
  const origLog = console.log;
  const origErr = console.error;
  beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
  });
  afterEach(() => {
    console.log = origLog;
    console.error = origErr;
  });

  test("logs summary and returns object", () => {
    const yamlDoc = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo
spec:
  template:
    spec:
      containers:
        - name: app
          image: nginx:1.21
`;
    const obj = parseYAML(yamlDoc);
    expect(obj.kind).toBe("Deployment");
    expect(obj.metadata.name).toBe("demo");
    expect(console.log).toHaveBeenCalledWith("YAML Parsed:");
  });
});