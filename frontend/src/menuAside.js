import { mdiCogOutline, mdiAccountGroupOutline, mdiMonitor } from "@mdi/js";

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
    to: "/configs",
    icon: mdiCogOutline,
    label: "Configs",
  },
];
