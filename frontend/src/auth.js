export function getRole() {
  return localStorage.getItem("role");
}

export function isDoctor() {
  return getRole() === "doctor";
}
