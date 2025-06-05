import { App, Astal, Gdk, Gtk } from "astal/gtk3"
import { timeout } from "astal/time"
import Variable from "astal/variable"
import Brightness from "./brightness"
import Wp from "gi://AstalWp"
import GLib from "gi://GLib?version=2.0"
import Hyprland from "gi://AstalHyprland"
import { bind } from "astal"

function OnScreenProgress({ visible }: { visible: Variable<boolean> }) {
  const brightness = Brightness.get_default()
  const speaker = Wp.get_default()?.get_default_speaker()

  const iconName = Variable("")
  const value = Variable(0)
  const initialTime = GLib.get_monotonic_time()

  let count = 0
  function show(v: number, icon: string) {
    // Don't show on application startup
    const time = GLib.get_monotonic_time()
    if (time - initialTime < 200_000) return

    visible.set(true)
    value.set(v)
    iconName.set(icon)
    count++
    timeout(2000, () => {
      count--
      if (count === 0) visible.set(false)
    })
  }

  function getVolumeIconName() {
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

  return (
    <revealer
      setup={(self) => {
        self.hook(brightness, "notify::screen", () =>
          show(brightness.screen, "display-brightness-symbolic"),
        )

        if (speaker) {
          self.hook(speaker, "notify::mute", () => {
            const volume = speaker.mute ? 0 : speaker.volume
            show(volume, getVolumeIconName())
          })
          self.hook(speaker, "notify::volume", () => {
            if (speaker.mute) speaker.set_mute(false)
            show(speaker.volume, getVolumeIconName())
          })
        }
      }}
      revealChild={visible()}
      child={
        <box className="OSD">
          <icon icon={iconName()} />
          <levelbar
            valign={Gtk.Align.CENTER}
            widthRequest={100}
            value={value()}
          />
          <label label={value((v) => `${Math.round(v * 100)}%`)} />
        </box>
      }
    />
  )
}

export default function OSD() {
  const visible = Variable(false)
  const hypr = Hyprland.get_default()
  const focused = bind(hypr, "focusedMonitor")

  return (
    <window
      monitor={focused.as((m) => m.id)}
      className="OSD"
      namespace="osd"
      application={App}
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.TOP}
      child={
        <eventbox
          onClick={() => visible.set(false)}
          child={<OnScreenProgress visible={visible} />}
        />
      }
    />
  )
}
