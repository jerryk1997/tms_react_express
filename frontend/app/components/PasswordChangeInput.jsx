import React, { useEffect } from "react";

function PasswordChangeInput(props) {
  function validatePassword() {
    // Define variables for each part of the regular expression
    const atLeastOneAlphabet = "(?=.+[A-Za-z])";
    const atLeastOneNumber = "(?=.+\\d)";
    const atLeastOneSpecial = "(?=.+[@$!%*?&.,;^_()=+\\-\\[\\]{}~:;'\"<>/|])";
    const allowedCharacters =
      "([A-Za-z\\d@$!%*?&.,;^_()=+\\-\\[\\]{}~:;'\"<>/|])";
    const minMaxLen = "{8,10}";

    // Construct the full regular expression using the defined parts
    const passwordPattern = new RegExp(
      `^${atLeastOneAlphabet}${atLeastOneNumber}${atLeastOneSpecial}${allowedCharacters}${minMaxLen}$`
    );

    if (!props.password || passwordPattern.test(props.password)) {
      props.setPasswordError("");
    } else {
      props.setPasswordError(
        "Password must be 8-10 characters and contain alphabets, numbers, and special characters."
      );
    }
  }

  let validatePasswordDebounce;
  useEffect(() => {
    props.setCanSubmit(false);
    validatePasswordDebounce = setTimeout(() => {
      validatePassword();
    }, 500);

    return () => clearTimeout(validatePasswordDebounce);
  }, [props.password]);

  return (
    <div>
      <div>
        <input
          style={{ width: "100%" }}
          type="password"
          value={props.password}
          onChange={e => props.setPassword(e.target.value)}
          disabled={props.disabled || false}
          placeholder={props.placeholder || ""}
          className="form-control"
        />
      </div>
      <div>
        {props.passwordError !== "" && (
          <small className="text-danger">{props.passwordError}</small>
        )}
      </div>
    </div>
  );
}

export default PasswordChangeInput;
