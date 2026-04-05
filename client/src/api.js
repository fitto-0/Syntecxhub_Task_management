/* ============================================
   API MODULE - Re-exports from services/api.js
   DO NOT USE - Import from services/api.js directly
   This file is kept for backwards compatibility
   ============================================ */

import api, { authService, taskService, projectService, monthGoalService } from "./services/api.js";

export { authService, taskService, projectService, monthGoalService };
export default api;
