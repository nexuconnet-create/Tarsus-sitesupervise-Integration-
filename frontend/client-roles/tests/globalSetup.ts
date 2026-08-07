import axios from "axios";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://127.0.0.1:8000";
const TEST_EMAIL = process.env.TEST_EMAIL ?? "sitengineer234@yopmail.com";
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? "";

/** Runs once before all test files. Logs in and stores token in TEST_TOKEN env var. */
export async function setup() {
  if (!TEST_PASSWORD) {
    throw new Error(
      "TEST_PASSWORD env var is required. Run: TEST_PASSWORD=<pass> npx vitest run tests/",
    );
  }
  const res = await axios.post(`${BASE_URL}/api/v1/auth/login/`, {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  const token: string = res.data?.access_token ?? res.data?.data?.access_token;
  if (!token) throw new Error(`Login failed — no access_token in response: ${JSON.stringify(res.data)}`);
  process.env.TEST_TOKEN = token;
}
