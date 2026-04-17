// Validates login credentials
export const validateLoginForm = (data) => {
  const errors = {};
  
  if (!data.email || !data.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!data.password || !data.password.trim()) {
    errors.password = "Password is required";
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (Object.keys(errors).length > 0) {
    throw { validationErrors: errors };
  }

  return {
    email: data.email.trim().toLowerCase(),
    password: data.password,
  };
};

// Validates new employee registration
export const validateRegisterForm = (data) => {
  const errors = {};

  if (!data.firstName?.trim()) errors.firstName = "First name is required";
  if (!data.lastName?.trim()) errors.lastName = "Last name is required";
  
  if (!data.email?.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Invalid email format";
  }

  if (!data.password || data.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (data.role === undefined || data.role === "") {
    errors.role = "Please select a user role";
  }

  if (Object.keys(errors).length > 0) throw { validationErrors: errors };

  return { ...data, email: data.email.trim().toLowerCase() };
};