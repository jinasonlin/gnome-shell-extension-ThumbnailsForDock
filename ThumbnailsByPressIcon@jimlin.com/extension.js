const Clutter = imports.gi.Clutter;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const GMenu = imports.gi.GMenu;
const Shell = imports.gi.Shell;
const Lang = imports.lang;
const Signals = imports.signals;
const Meta = imports.gi.Meta;
const St = imports.gi.St;
const Mainloop = imports.mainloop;
const Atk = imports.gi.Atk;

const AppFavorites = imports.ui.appFavorites;
const DND = imports.ui.dnd;
const IconGrid = imports.ui.iconGrid;
const Main = imports.ui.main;
const Overview = imports.ui.overview;
const Search = imports.ui.search;
const Tweener = imports.ui.tweener;
const Workspace = imports.ui.workspace;
const Params = imports.misc.params;


const PopupMenu = imports.ui.popupMenu;
const AppDisplay = imports.ui.appDisplay;

/*function newinit (text, params) {
    this.parent(params);
    if (text instanceof St.BoxLayout) {
            this.addActor(text);
    } else {
            this.label = new St.Label({ text: text });
            this.addActor(this.label);
    	this.actor.label_actor = this.label
    }

}*/


function enhanceRemoveAll (){
	this.removeAll();
	let children = this.box.get_children().forEach(Lang.bind(this, function(child){
			this.box.remove_actor(child);
	}));
}


function redisplay () {
        this.enhanceRemoveAll();

        let windows = this._source.app.get_windows();

        // Display the app windows menu items and the separator between windows
        // of the current desktop and other windows.
        let activeWorkspace = global.screen.get_active_workspace();
        let separatorShown = windows.length > 0 && windows[0].get_workspace() != activeWorkspace;
 
        let contentArea = new St.BoxLayout({ vertical: true});
        let scrollView = new St.ScrollView({ name: 'popup-misc-menu',
                                             style_class: 'pop-scroll',
                                             vscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
                                             hscrollbar_policy: Gtk.PolicyType.NEVER,
                                             x_fill: true,
                                             y_fill: false
                                           });
        scrollView.add_actor(contentArea);

        if(windows.length < 5) {
            scrollView.get_vscroll_bar().hide();
        }
        if(windows.length >= 6){
            for(let i=0; i<windows.length; i++){
                let item = this._appendMenuItem(windows[i].title);
                item._window = windows[i];
                contentArea.add_actor(item.actor);
                this._connectItemSignals(item);
            }
        }else{
            for (let i = 0; i < windows.length; i++) {
                let mutterWindow = windows[i].get_compositor_private();
                let windowTexture = mutterWindow.get_texture();
                let windowClone = new Clutter.Clone ({
                                        source: windowTexture,
                                        reactive: true,
                                        width: 200,
                                        height: 150});
                let windowItemBox = new St.BoxLayout({ style_class: 'screen-shot-in-popup',
                                                       vertical: true});
                windowItemBox.add_actor(windowClone);
                let item = new PopupMenu.PopupMenuItem('');
		if(windowItemBox instanceof St.BoxLayout)
			item.addActor(windowItemBox);
                item._window = windows[i];
                contentArea.add_actor(item.actor);
                this._connectItemSignals(item);
                let spacingRect = new St.BoxLayout({ style_class: 'spacingItem'});
                if (i < windows.length -1) contentArea.add_actor(spacingRect);

            }
        }
	this.addActor(scrollView);

        if (!this._source.app.is_window_backed()) {
            if (windows.length > 0)
                this._appendSeparator();

            let isFavorite = AppFavorites.getAppFavorites().isFavorite(this._source.app.get_id());

            this._newWindowMenuItem = this._appendMenuItem(_("New Window"));
            this._appendSeparator();

            this._toggleFavoriteMenuItem = this._appendMenuItem(isFavorite ? _("Remove from Favorites")
                                                                : _("Add to Favorites"));
        }

}


let init_original = null; 
let enhanceRemoveAll_original = null; 
let redisplay_original = null; 
function init() {
	init_original = PopupMenu.PopupMenuItem.prototype._init; 
	redisplay_original = AppDisplay.AppIconMenu.prototype._redisplay; 

}

function enable() {
	//PopupMenu.PopupMenuItem.prototype._init = newinit; 
	PopupMenu.PopupMenuBase.prototype.enhanceRemoveAll = enhanceRemoveAll; 
	AppDisplay.AppIconMenu.prototype._redisplay = redisplay; 
}

function disable() {
	//PopupMenu.PopupMenuItem.prototype._init = init_original; 
	AppDisplay.AppIconMenu.prototype._redisplay = redisplay_original; 
}
