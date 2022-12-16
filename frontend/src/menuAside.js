import { mdiUpdate, mdiAccountGroupOutline, mdiMonitor } from "@mdi/js";

export default [
  {
    to: "/",
    icon: mdiMonitor,
    label: "Dashboard",
  },
  {
    to: "/accounts",
    icon: mdiAccountGroupOutline,
    label: "Accounts",
  },
  {
    to: "/updates",
    icon: mdiUpdate,
    label: "Updates",
  }
];
