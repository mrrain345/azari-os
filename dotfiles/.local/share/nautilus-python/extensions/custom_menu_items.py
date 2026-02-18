#!/usr/bin/env python3

import subprocess
from gi.repository import Nautilus, GObject

class CustomMenuItemsProvider(GObject.GObject, Nautilus.MenuProvider):
    def __init__(self):
        pass

    # Handle right-click on files
    def get_file_items(self, files):
        if len(files) != 1 or not files[0].is_directory():
            return []
        return self.custom_menu_items(files[0])

    # Handle right-click on background (empty space)
    def get_background_items(self, directory):
        return self.custom_menu_items(directory)
    
    def custom_menu_items(self, directory):
        terminal = Nautilus.MenuItem(
            name="TerminalMenuItem::open",
            label="Open in Terminal",
            tip="Open this directory in the terminal",
        )
        
        vscode = Nautilus.MenuItem(
            name="VSCodeMenuItem::open",
            label="Open in Code",
            tip="Open this directory in the VS Code",
        )

        path = directory.get_location().get_path()
        # terminal.connect("activate", self.open_in_terminal, path)
        vscode.connect("activate", self.open_in_vscode, path)
        
        # return [terminal, vscode]
        return [vscode]
        
    def open_in_terminal(self, menu, path):
        subprocess.Popen(["uwsm", "app", "--", "alacritty", "--working-directory", path])
        
    def open_in_vscode(self, menu, path):
        subprocess.Popen(["uwsm", "app", "--", "code", "-n", path])
