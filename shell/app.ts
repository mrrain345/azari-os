import { App } from "astal/gtk3"
import style from "./style.scss"
import Topbar from "./widgets/topbar/topbar"
import OSD from "./widgets/osd/osd"
import Applauncher, { launcher } from "./widgets/applauncher/applauncher"
import Backdrop from "./widgets/system-menu/backdrop"

App.start({
  css: style,
  main() {
    App.get_monitors().map(Topbar)
    OSD()
    // Backdrop()
    Applauncher()
  },
  requestHandler(request, res) {
    if (request === "launcher") {
      launcher((app) => res(app?.entry ?? ""))
    } else {
      printerr(`Unhandled request: ${request}`)
      res("")
    }
  },
})
