import { Variable } from "astal"
import { App, Astal } from "astal/gtk3"

export default function Backdrop() {
  const { LEFT, RIGHT, TOP, BOTTOM } = Astal.WindowAnchor
  const visible = Variable(true)

  return (
    <window
      css={"background-color: rgba(0, 0, 0, 0.2);"}
      name="backdrop"
      className="Backdrop"
      application={App}
      layer={Astal.Layer.OVERLAY}
      anchor={LEFT | RIGHT | TOP | BOTTOM}
      exclusivity={Astal.Exclusivity.IGNORE}
      visible={visible()}
      child={<eventbox onClick={() => visible.set(false)} />}
    />
  )
}
