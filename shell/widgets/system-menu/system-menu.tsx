import { Variable } from "astal"
import { App, Astal } from "astal/gtk3"

export default function SystemMenu() {
  const visible = Variable(false)

  return (
    <window
      name="system-menu"
      className="SystemMenu"
      application={App}
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
      exclusivity={Astal.Exclusivity.IGNORE}
      visible={visible()}
      child={
        <eventbox
          onClick={() => visible.set(false)}
          // child={<OnScreenProgress visible={visible} />}
        />
      }
    />
  )
}
