import loginFormReducer, {
  resetForm,
  setField,
  setFieldErrors,
} from "../loginFormSlice";

describe("loginFormSlice", () => {
  const initialState = {
    username: "",
    password: "",
    fieldErrors: {},
  };

  it("returns the initial state", () => {
    expect(loginFormReducer(undefined, { type: "@@init" })).toEqual(initialState);
  });

  it("setField updates the username field", () => {
    const state = loginFormReducer(
      initialState,
      setField({ field: "username", value: "john" }),
    );
    expect(state.username).toBe("john");
    expect(state.password).toBe("");
  });

  it("setField updates the password field", () => {
    const state = loginFormReducer(
      initialState,
      setField({ field: "password", value: "secret123" }),
    );
    expect(state.password).toBe("secret123");
  });

  it("setFieldErrors replaces the fieldErrors object", () => {
    const state = loginFormReducer(
      initialState,
      setFieldErrors({ username: "Too short" }),
    );
    expect(state.fieldErrors).toEqual({ username: "Too short" });
  });

  it("resetForm restores the initial state", () => {
    const populated = {
      username: "john",
      password: "secret123",
      fieldErrors: { username: "Too short" },
    };
    expect(loginFormReducer(populated, resetForm())).toEqual(initialState);
  });
});
