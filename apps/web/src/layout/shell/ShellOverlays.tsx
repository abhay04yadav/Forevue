import { CommandPalette } from "./CommandPalette";
import { HelpPanel } from "./HelpPanel";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { NotificationsPanel } from "./NotificationsPanel";
import { ProfileMenu } from "./ProfileMenu";

/** Global shell overlays mounted once per authenticated layout */
export function ShellOverlays() {
  return (
    <>
      <CommandPalette />
      <NotificationsPanel />
      <ProfileMenu />
      <HelpPanel />
      <MobileNavDrawer />
    </>
  );
}
