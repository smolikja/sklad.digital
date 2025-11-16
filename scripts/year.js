export const updateCurrentYear = () => {
  const currentYear = document.getElementById('current-year');
  if (!currentYear) {
    return;
  }
  currentYear.textContent = new Date().getFullYear();
};
