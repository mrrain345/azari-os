import { Variable, GLib, bind } from "astal"
import { Astal, Gtk, Gdk, App } from "astal/gtk3"
import Hyprland from "gi://AstalHyprland"
import Battery from "gi://AstalBattery"
import Wp from "gi://AstalWp"
import Network from "gi://AstalNetwork"
import Tray from "gi://AstalTray"

function SysTray() {
  const tray = Tray.get_default()

  return (
    <box className="SysTray">
      {bind(tray, "items").as((items) =>
        items.map((item) =>
          item.isMenu ? (
            <menubutton
              tooltipMarkup={bind(item, "tooltipMarkup")}
              usePopover={false}
              actionGroup={bind(item, "actionGroup").as((ag) => [
                "dbusmenu",
                ag,
              ])}
              menuModel={bind(item, "menuModel")}
              child={<icon gicon={bind(item, "gicon")} />}
            />
          ) : (
            <button
              tooltipMarkup={bind(item, "tooltipMarkup")}
              child={<icon gicon={bind(item, "gicon")} />}
              onClicked={() => item.activate(0, 0)}
            />
          ),
        ),
      )}
    </box>
  )
}

function Wifi() {
  const network = Network.get_default()
  const wifi = bind(network, "wifi")

  return (
    <box visible={wifi.as(Boolean)}>
      {wifi.as(
        (wifi) =>
          wifi && [
            <icon
              tooltipText={bind(wifi, "ssid").as((ssid) => `Wi-Fi: ${ssid}`)}
              className="Wifi"
              icon={bind(wifi, "iconName")}
            />,
          ],
      )}
    </box>
  )
}

function AudioIcon() {
  const speaker = Wp.get_default()?.audio.defaultSpeaker
  const iconName = Variable("audio-volume-high-symbolic")

  function getIconName() {
    if (!speaker) return "audio-volume-muted-symbolic"
    if (speaker.mute || speaker.volume === 0) {
      return "audio-volume-muted-symbolic"
    } else {
      return speaker.volumeIcon.replace(
        /^microphone-sensitivity-/,
        "audio-volume-",
      )
    }
  }

  if (!speaker) return null
  return (
    <eventbox
      className="AudioIcon"
      setup={(self) => {
        self.hook(speaker, "notify::mute", () => iconName.set(getIconName()))
        self.hook(speaker, "notify::volume", () => iconName.set(getIconName()))
      }}
      onScroll={(self, ev) => {
        const dir = ev.delta_y < 0 ? -1 : 1
        speaker.volume = speaker.volume + dir * 0.01
      }}
      child={
        <icon
          icon={iconName()}
          tooltipText={bind(speaker, "volume").as(
            (v) => `Volume: ${Math.round(v * 100)}%`,
          )}
        />
      }
    />
  )
}

function BatteryLevel() {
  const bat = Battery.get_default()

  return (
    <box className="Battery" visible={bind(bat, "isPresent")}>
      {[
        <icon
          icon={bind(bat, "batteryIconName")}
          tooltipText={bind(bat, "percentage").as(
            (p) => `Battery: ${Math.floor(p * 100)}%`,
          )}
        />,
      ]}
    </box>
  )
}

function Workspaces(props: { monitor: number }) {
  const hypr = Hyprland.get_default()

  return (
    <box className="Workspaces">
      {bind(hypr, "workspaces").as((wss) =>
        wss
          .filter((ws) => ws.monitor.id === props.monitor)
          .sort((a, b) => a.id - b.id)
          .map((ws) => (
            <button
              className={bind(hypr, "focusedWorkspace").as((fw) =>
                ws === fw ? "focused" : "",
              )}
              onClicked={() => ws.focus()}
              label={bind(ws, "name").as(String)}
            />
          )),
      )}
    </box>
  )
}

function Time({ format = "%d.%m.%Y - %H:%M" }) {
  const time = Variable<string>("").poll(
    1000,
    () => GLib.DateTime.new_now_local().format(format)!,
  )

  return <label className="Time" onDestroy={() => time.drop()} label={time()} />
}

export default function Topbar(monitor: Gdk.Monitor, index: number) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <window
      className="Topbar"
      gdkmonitor={monitor}
      application={App}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      child={
        <centerbox>
          <box hexpand halign={Gtk.Align.START}>
            {[<Workspaces monitor={index} />]}
          </box>
          <box child={<Time />} />
          <box hexpand halign={Gtk.Align.END}>
            <SysTray />
            <box className="RightIcons">
              <Wifi />
              <AudioIcon />
              <BatteryLevel />
            </box>
          </box>
        </centerbox>
      }
    />
  )
}
