import signupFormReducer, {
  resetForm,
  setField,
  setFieldErrors,
} from "../signupFormSlice";

describe("signupFormSlice", () => {
  const initialState = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fieldErrors: {},
  };

  it("returns the initial state", () => {
    expect(signupFormReducer(undefined, { type: "@@init" })).toEqual(initialState);
  });

  it("setField updates the username field", () => {
    const state = signupFormReducer(
      initialState,
      setField({ field: "username", value: "john" }),
    );
    expect(state.username).toBe("john");
  });

  it("setField updates the email field", () => {
    const state = signupFormReducer(
      initialState,
      setField({ field: "email", value: "john@example.com" }),
    );
    expect(state.email).toBe("john@example.com");
  });

  it("setField updates the password field", () => {
    const state = signupFormReducer(
      initialState,
      setField({ field: "password", value: "secret123" }),
    );
    expect(state.password).toBe("secret123");
  });

  it("setField updates the confirmPassword field", () => {
    const state = signupFormReducer(
      initialState,
      setField({ field: "confirmPassword", value: "secret123" }),
    );
    expect(state.confirmPassword).toBe("secret123");
  });

  it("setFieldErrors replaces the fieldErrors object", () => {
    const state = signupFormReducer(
      initialState,
      setFieldErrors({ confirmPassword: "Passwords do not match" }),
    );
    expect(state.fieldErrors).toEqual({ confirmPassword: "Passwords do not match" });
  });

  it("resetForm restores the initial state", () => {
    const populated = {
      username: "john",
      email: "john@example.com",
      password: "secret123",
      confirmPassword: "secret123",
      fieldErrors: { username: "Too short" },
    };
    expect(signupFormReducer(populated, resetForm())).toEqual(initialState);
  });
});
