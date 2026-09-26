import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ArrowRightLeft,
  MessageCircle,
  Dumbbell,
  CalendarRange,
  NotebookPen,
  UserRound,
} from "lucide-react";
import type { Assessment, PlayerProfile, Session, Topic } from "./types";
import { LocalPlayerRepository } from "./lib/persistence";
import { createProfile, PlayerService } from "./lib/playerService";
import { Onboarding } from "./features/Onboarding";
import { Dashboard, type Page } from "./features/Dashboard";
import { Transition } from "./features/Transition";
import { Coach } from "./features/Coach";
import { DrillLibrary, TrainingPlan } from "./features/Training";
import { Sessions } from "./features/Sessions";
import { Profile, downloadText } from "./features/Profile";
import { useTrainingTools } from "./lib/browserTools";
const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "My Transition", icon: ArrowRightLeft },
  { name: "Coach", icon: MessageCircle },
  { name: "Drills", icon: Dumbbell },
  { name: "My Plan", icon: CalendarRange },
  { name: "Sessions", icon: NotebookPen },
  { name: "Profile", icon: UserRound },
] as const;
const getPage = (): Page =>
  navigation.find(
    (x) => `#${x.name.toLowerCase().replaceAll(" ", "-")}` === location.hash,
  )?.name ?? "Dashboard";
export default function App() {
  const [repository] = useState(
    () =>
      new LocalPlayerRepository({
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, value) => localStorage.setItem(key, value),
        removeItem: (key) => localStorage.removeItem(key),
      }),
  );
  const [service] = useState(() => new PlayerService(repository));
  const [loaded] = useState(() => {
    try {
      return { profile: repository.load(), error: "" };
    } catch (e) {
      return {
        profile: null,
        error: e instanceof Error ? e.message : "Storage is unavailable.",
      };
    }
  });
  const [profile, setProfile] = useState<PlayerProfile | null>(loaded.profile);
  const [fatal, setFatal] = useState(loaded.error);
  const [error, setError] = useState("");
  const [page, setPage] = useState<Page>(getPage);
  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [drill, setDrill] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [recoveryConfirm, setRecoveryConfirm] = useState(false);
  useEffect(() => {
    const changed = () => {
      if (location.hash !== "#main-content") setPage(getPage());
    };
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  useEffect(() => {
    const changed = (e: StorageEvent) => {
      if (e.key === "picklebridge.profile.v1") {
        try {
          setProfile(repository.load());
          setNotice("Profile refreshed from another tab.");
        } catch (err) {
          setFatal(
            err instanceof Error
              ? err.message
              : "Could not refresh saved data.",
          );
        }
      }
    };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, [repository]);
  function navigate(next: Page) {
    setPage(next);
    location.hash = next.toLowerCase().replaceAll(" ", "-");
    setError("");
    window.scrollTo(0, 0);
  }
  function save(p: PlayerProfile) {
    const next = service.save(p);
    setProfile(next);
    setError("");
    return next;
  }
  function run(action: () => void) {
    try {
      action();
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the change.");
    }
  }
  function complete(a: Assessment) {
    run(() => {
      save(
        profile
          ? {
              ...profile,
              assessment: a,
              pinned:
                profile.assessment.sport === a.sport ? profile.pinned : [],
              dismissed:
                profile.assessment.sport === a.sport ? profile.dismissed : [],
            }
          : createProfile(a),
      );
      setEditing(false);
      navigate(profile ? "Profile" : "My Transition");
    });
  }
  function focus(topic: Topic, action: "pin" | "dismiss" | "restore") {
    if (profile)
      run(() =>
        setProfile(service.update_player_focus(profile, topic, action)),
      );
  }
  function log(s: Session) {
    if (profile) {
      const next = service.log_session(profile, s);
      setProfile(next);
      setShowForm(false);
      setNotice("Session saved. Your recommendations have been updated.");
    }
  }
  function openDrill(id: string) {
    setDrill(id);
    navigate("Drills");
  }
  function reset() {
    run(() => {
      repository.reset();
      setProfile(null);
      setFatal("");
      setEditing(false);
      setNotice("");
      setRecoveryConfirm(false);
      navigate("Dashboard");
    });
  }
  useTrainingTools(profile, () => {
    setShowForm(true);
    navigate("Sessions");
  });
  if (fatal)
    return (
      <main className="recovery panel">
        <h1>Let's protect your saved data.</h1>
        <p role="alert">{fatal}</p>
        <p>The app has not overwritten the stored data.</p>
        <div className="inline">
          <button
            className="secondary"
            onClick={() =>
              run(() =>
                downloadText(
                  repository.raw() ?? "",
                  "picklebridge-recovery.json",
                ),
              )
            }
          >
            Export stored data
          </button>
          <button className="danger" onClick={() => setRecoveryConfirm(true)}>
            Start over
          </button>
        </div>
        {recoveryConfirm && (
          <div className="notice">
            <p>
              Resetting permanently removes the unreadable data. Keep an
              exported copy first.
            </p>
            <button className="danger" onClick={reset}>
              Confirm reset
            </button>
            <button
              className="secondary"
              onClick={() => setRecoveryConfirm(false)}
            >
              Cancel
            </button>
          </div>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </main>
    );
  if (!profile || editing)
    return (
      <>
        {error && (
          <div className="global-error error" role="alert">
            {error}
          </div>
        )}
        <Onboarding
          initial={profile?.assessment}
          onComplete={complete}
          onCancel={profile ? () => setEditing(false) : undefined}
        />
      </>
    );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar">
        <a href="#dashboard" className="brand">
          <span className="brand-mark">P</span>PickleBridge
        </a>
        <span className="sidebar-caption">TRANSLATE YOUR GAME</span>
        <label className="mobile-navigation">
          Go to
          <select
            value={page}
            onChange={(e) => {
              navigate(e.target.value as Page);
              setDrill(null);
            }}
          >
            {navigation.map((x) => (
              <option key={x.name} value={x.name}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <nav aria-label="Main navigation">
          {navigation.map(({ name, icon: Icon }) => (
            <a
              key={name}
              href={`#${name.toLowerCase().replaceAll(" ", "-")}`}
              aria-current={page === name ? "page" : undefined}
              className={page === name ? "nav-item active" : "nav-item"}
              onClick={() => {
                navigate(name);
                if (name === "Drills") setDrill(null);
              }}
            >
              <Icon size={19} />
              <span>{name}</span>
              {page === name && <span className="nav-dot" />}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="eyebrow light">KEEP THE GOOD INSTINCTS.</span>
            <p>
              Build the next part
              <br />
              of your game.
            </p>
          </div>
          <button className="player-button" onClick={() => navigate("Profile")}>
            <span className="avatar">
              {profile.assessment.name.slice(0, 1).toUpperCase()}
            </span>
            <span>
              <strong>{profile.assessment.name}</strong>
              <small>Local player profile</small>
            </span>
            <UserRound size={17} />
          </button>
        </div>
      </aside>
      <main id="main-content" className="workspace">
        <div className="topbar">
          <span>YOUR PERSONAL PICKLEBALL PLAYBOOK</span>
          <span className="local-badge">Saved on this device</span>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {notice && (
          <div className="status-notice" role="status">
            {notice}
            <button
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
            >
              ×
            </button>
          </div>
        )}
        {page === "Dashboard" && (
          <Dashboard
            profile={profile}
            navigate={navigate}
            onLog={() => {
              setShowForm(true);
              navigate("Sessions");
            }}
            onDrill={openDrill}
            onFocus={focus}
            onResolve={(id) =>
              run(() => setProfile(service.resolve_issue(profile, id)))
            }
          />
        )}
        {page === "My Transition" && (
          <Transition profile={profile} onFocus={focus} />
        )}
        {page === "Coach" && <Coach profile={profile} onSave={save} />}
        {page === "Drills" && (
          <DrillLibrary
            profile={profile}
            selected={drill}
            setSelected={setDrill}
          />
        )}
        {page === "My Plan" && (
          <TrainingPlan
            profile={profile}
            onSave={(p) => run(() => save(p))}
            onDrill={openDrill}
          />
        )}
        {page === "Sessions" && (
          <Sessions
            profile={profile}
            onSave={log}
            showForm={showForm}
            setShowForm={setShowForm}
          />
        )}
        {page === "Profile" && (
          <Profile
            profile={profile}
            onEdit={() => setEditing(true)}
            onReset={reset}
            onExport={() =>
              run(() =>
                downloadText(
                  repository.raw() ?? "",
                  "picklebridge-profile.json",
                ),
              )
            }
          />
        )}
        <footer className="app-footer">
          PickleBridge · Don't start over. Translate your game.
          <span>Local guidance. Real practice.</span>
        </footer>
      </main>
    </div>
  );
}
