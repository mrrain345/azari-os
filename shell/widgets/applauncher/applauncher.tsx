import Apps from "gi://AstalApps"
import { App, Astal, Gdk, Gtk } from "astal/gtk3"
import { bind, Variable } from "astal"
import { Scrollable } from "astal/gtk3/widget"
import Hyprland from "gi://AstalHyprland"

let _launcher: Gtk.Window | null = null
let _launch: ((app: Apps.Application | null) => void) | null = null

// Start the launcher
export function launcher(launch: (app: Apps.Application | null) => void) {
  if (_launch) _launch(null)
  _launch = launch
  _launcher?.show()
}

function AppButton({
  app,
  setFocused,
  launch,
}: {
  app: Apps.Application
  setFocused: (app: Apps.Application) => void
  launch: (app: Apps.Application | null) => void
}) {
  return (
    <button
      className="AppButton"
      onGrabFocus={() => setFocused(app)}
      onClicked={() => launch(app)}
      child={
        <box>
          <icon icon={app.iconName} />
          <box valign={Gtk.Align.CENTER} vertical>
            <label className="name" truncate xalign={0} label={app.name} />
            {app.description ?
              <label
                className="description"
                wrap
                xalign={0}
                label={app.description}
              />
            : <box />}
          </box>
        </box>
      }
    />
  )
}

export default function Applauncher() {
  const apps = new Apps.Apps()
  const width = Variable(1000)

  const hypr = Hyprland.get_default()
  const monitor = bind(hypr, "focusedMonitor")

  let search: Gtk.Entry | null = null
  let scrollable: Scrollable | null = null
  let focused: Apps.Application | null = null

  function startsWith(app: Apps.Application, search: string) {
    return app.name.toLowerCase().startsWith(search.toLowerCase())
  }

  function getApps(search: string) {
    const list = apps.fuzzy_query(search)
    if (!search) return list
    const start = list.filter((app) => startsWith(app, search))
    const rest = list.filter((app) => !startsWith(app, search))
    return [...start, ...rest]
  }

  const text = Variable("")
  const list = text((text) => getApps(text))

  function reset() {
    text.set("")
    focused = null
    scrollable?.get_vadjustment().set_value(0)
    search?.grab_focus_without_selecting()

    if (_launch) _launch(null)
    _launch = null
    _launcher?.hide()
  }

  function launch(app: Apps.Application | null) {
    if (_launch) _launch(app)
    else app?.launch()
    _launch = null
    reset()
  }

  return (
    <window
      name="launcher"
      monitor={monitor.as((m) => m.id)}
      setup={(self) => {
        _launcher = self
        self.hide()
      }}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM}
      exclusivity={Astal.Exclusivity.IGNORE}
      keymode={Astal.Keymode.ON_DEMAND}
      application={App}
      onShow={(self) => {
        width.set(self.get_current_monitor().workarea.width)
      }}
      onKeyPressEvent={(self, ev) => {
        if (ev.get_keyval()[1] === Gdk.KEY_Escape) reset()
      }}
      child={
        <box>
          <eventbox widthRequest={width((w) => w / 2)} expand onClick={reset} />
          <box hexpand={false} vertical>
            <eventbox heightRequest={100} onClick={reset} />
            <box widthRequest={500} className="Applauncher" vertical>
              <entry
                className="Search"
                setup={(self) => (search = self)}
                onGrabFocus={() => (focused = null)}
                placeholderText="Search"
                text={text()}
                onChanged={(self) => {
                  text.set(self.text)
                  scrollable?.get_vadjustment().set_value(0)
                }}
                onKeyPressEvent={(self, ev) => {
                  if (ev.get_keyval()[1] === Gdk.KEY_Return) {
                    launch(focused ?? getApps(text.get())[0])
                  }
                }}
              />
              <scrollable
                className="AppList"
                setup={(self) => (scrollable = self)}
                heightRequest={465}
                visible={list.as((l) => l.length > 0)}
                onKeyPressEvent={(self, ev) => {
                  const [_, keyval] = ev.get_keyval()
                  const code = Gdk.keyval_to_unicode(keyval)
                  const key = String.fromCodePoint(code)

                  if (!code || !search) return
                  if (keyval === Gdk.KEY_Tab) return
                  if (keyval === Gdk.KEY_Return) return

                  if (keyval === Gdk.KEY_BackSpace) {
                    text.set(text.get().slice(0, -1))
                  } else {
                    text.set(text.get() + key)
                  }

                  search.set_position(-1)
                  search.grab_focus_without_selecting()
                  focused = null
                }}
                child={
                  <box spacing={6} vertical className="AppListContent">
                    {list.as((list) =>
                      list.map((app) => (
                        <AppButton
                          app={app}
                          setFocused={(a) => (focused = a)}
                          launch={launch}
                        />
                      )),
                    )}
                  </box>
                }
              />
              <box
                className="not-found"
                vertical
                visible={list.as((l) => l.length === 0)}
              >
                <icon icon="system-search-symbolic" />
                <label label="No match found" />
              </box>
            </box>
            <eventbox expand onClick={reset} />
          </box>
          <eventbox widthRequest={width((w) => w / 2)} expand onClick={reset} />
        </box>
      }
    />
  )
}
