import time
from typing import Dict, Any, Optional

class ThemeSettingsManager:
    """Manages the global active workshop visual theme and mode."""
    def __init__(self, default_theme: str = "minecraft", default_mode: str = "dark"):
        self._config: Dict[str, Any] = {
            "theme": default_theme,
            "mode": default_mode,
            "updated_at": time.time(),
        }

    def get_theme(self) -> Dict[str, Any]:
        return self._config.copy()

    def set_theme(self, theme: str, mode: str = "dark") -> Dict[str, Any]:
        clean_theme = (theme or "minecraft").strip().lower()
        clean_mode = "light" if (mode or "dark").strip().lower() == "light" else "dark"
        self._config["theme"] = clean_theme
        self._config["mode"] = clean_mode
        self._config["updated_at"] = time.time()
        return self._config.copy()


class AnnouncementSettingsManager:
    """Manages global administrative broadcast alerts for all connected rooms."""
    def __init__(self):
        self._announcement: Dict[str, Any] = {
            "message": "",
            "timestamp": 0.0,
            "active": False,
        }

    def get_announcement(self) -> Dict[str, Any]:
        return self._announcement.copy()

    def get_public_announcement(self) -> Dict[str, Any]:
        """Returns active announcement or empty payload for client HUD display."""
        if self._announcement.get("active"):
            return self._announcement.copy()
        return {"active": False, "message": ""}

    def set_announcement(self, message: str) -> Dict[str, Any]:
        clean_msg = (message or "").strip()
        if not clean_msg:
            return self.clear_announcement()

        self._announcement["active"] = True
        self._announcement["message"] = clean_msg
        self._announcement["timestamp"] = time.time()
        return self._announcement.copy()

    def clear_announcement(self) -> Dict[str, Any]:
        self._announcement["active"] = False
        self._announcement["message"] = ""
        self._announcement["timestamp"] = time.time()
        return self._announcement.copy()


class WorkshopSettings:
    """
    Unified manager for event-wide settings, isolating domain state
    from HTTP routing controllers (Separation of Concerns).
    """
    def __init__(self):
        self.theme = ThemeSettingsManager()
        self.announcements = AnnouncementSettingsManager()

    # Theme convenience proxies
    def get_theme(self) -> Dict[str, Any]:
        return self.theme.get_theme()

    def set_theme(self, theme: str, mode: str = "dark") -> Dict[str, Any]:
        return self.theme.set_theme(theme, mode)

    # Announcement convenience proxies
    def get_announcement(self) -> Dict[str, Any]:
        return self.announcements.get_announcement()

    def get_public_announcement(self) -> Dict[str, Any]:
        return self.announcements.get_public_announcement()

    def set_announcement(self, message: str) -> Dict[str, Any]:
        return self.announcements.set_announcement(message)

    def clear_announcement(self) -> Dict[str, Any]:
        return self.announcements.clear_announcement()


# Global Singleton for Workshop Settings
workshop_settings = WorkshopSettings()
