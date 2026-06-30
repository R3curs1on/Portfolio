const profile = {
  github: "R3curs1on",
  leetcode: "Vedant333",
  codeforces: "vedant333",
  resumeUrl: "https://drive.google.com/file/d/1QJ4c0infaUUM0z5TrzqFDT2mMS3Vjoch/preview",
};

const fallbackData = {
  leetcode: {
    solved: 700,
    rating: 1866,
    contests: 28,
    streak: 41,
    note: "Live GraphQL blocked. Showing local profile snapshot.",
    heatmap: [
      0, 1, 2, 2, 1, 0, 3, 4, 2, 1, 0, 1, 2, 3,
      1, 0, 2, 3, 2, 1, 0, 2, 2, 3, 4, 2, 1, 0,
      0, 1, 1, 3, 4, 3, 2, 1, 0, 1, 2, 1, 3, 4,
      2, 1, 0, 1, 2, 2, 4, 3, 1, 1, 0, 2, 3, 4,
    ],
  },
};

function logDebug(event, details) {
  const raw = localStorage.getItem("portfolio-debug-log");
  const entries = raw ? JSON.parse(raw) : [];
  entries.unshift({
    at: new Date().toISOString(),
    event,
    details,
  });
  localStorage.setItem("portfolio-debug-log", JSON.stringify(entries.slice(0, 80)));
}

logDebug("page_load", { page: "modified.html" });

const roleLines = Array.from(document.querySelectorAll(".role-line"));
let activeRoleIndex = 0;

function rotateRoles() {
  roleLines.forEach((line, index) => {
    line.classList.toggle("is-active", index === activeRoleIndex);
  });
  activeRoleIndex = (activeRoleIndex + 1) % roleLines.length;
}

if (roleLines.length > 0) {
  rotateRoles();
  window.setInterval(rotateRoles, 2200);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const animatedCounters = new WeakSet();

function animateCounter(counter) {
  if (animatedCounters.has(counter)) {
    return;
  }

  animatedCounters.add(counter);
  const target = Number(counter.dataset.target || 0);
  const suffix = counter.dataset.suffix || "";
  const duration = 1400;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(target * eased);
    counter.textContent = `${currentValue}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.55 }
);

document.querySelectorAll(".counter").forEach((counter) => {
  counterObserver.observe(counter);
});

const nav = document.querySelector(".site-nav");

function syncNavState() {
  nav.classList.toggle("is-condensed", window.scrollY > 24);
}

window.addEventListener("scroll", syncNavState, { passive: true });
syncNavState();

const resumeModal = document.getElementById("resume-modal");
const resumeFrame = document.getElementById("resume-frame");
const resumeOpeners = [
  document.getElementById("resume-trigger"),
  document.getElementById("resume-btn-hero"),
];
const resumeCloser = document.getElementById("resume-close");

function openResume() {
  resumeFrame.src = profile.resumeUrl;
  resumeModal.classList.add("is-open");
  resumeModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  logDebug("resume_open", { source: "ui" });
}

function closeResume() {
  resumeFrame.src = "";
  resumeModal.classList.remove("is-open");
  resumeModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

resumeOpeners.forEach((button) => {
  if (!button) {
    return;
  }
  button.addEventListener("click", openResume);
});

if (resumeCloser) {
  resumeCloser.addEventListener("click", closeResume);
}

if (resumeModal) {
  resumeModal.addEventListener("click", (event) => {
    if (event.target === resumeModal) {
      closeResume();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && resumeModal.classList.contains("is-open")) {
    closeResume();
  }
});

const heroCanvas = document.getElementById("heroCanvas");
const heroSection = document.getElementById("hero");
const heroContext = heroCanvas.getContext("2d");
let particles = [];
let heroWidth = 0;
let heroHeight = 0;
const pointer = { x: null, y: null };

function buildParticles() {
  const count = Math.max(30, Math.floor(heroWidth / 58));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * heroWidth,
    y: Math.random() * heroHeight,
    velocityX: (Math.random() - 0.5) * 0.34,
    velocityY: (Math.random() - 0.5) * 0.34,
  }));
}

function resizeHeroCanvas() {
  const bounds = heroSection.getBoundingClientRect();
  heroWidth = bounds.width;
  heroHeight = bounds.height;
  heroCanvas.width = heroWidth * window.devicePixelRatio;
  heroCanvas.height = heroHeight * window.devicePixelRatio;
  heroCanvas.style.width = `${heroWidth}px`;
  heroCanvas.style.height = `${heroHeight}px`;
  heroContext.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  buildParticles();
}

function drawHeroBackground() {
  heroContext.clearRect(0, 0, heroWidth, heroHeight);

  particles.forEach((particle) => {
    particle.x += particle.velocityX;
    particle.y += particle.velocityY;

    if (particle.x <= 0 || particle.x >= heroWidth) {
      particle.velocityX *= -1;
    }

    if (particle.y <= 0 || particle.y >= heroHeight) {
      particle.velocityY *= -1;
    }
  });

  for (let index = 0; index < particles.length; index += 1) {
    const current = particles[index];

    for (let inner = index + 1; inner < particles.length; inner += 1) {
      const target = particles[inner];
      const distance = Math.hypot(current.x - target.x, current.y - target.y);

      if (distance > 140) {
        continue;
      }

      const opacity = 1 - distance / 140;
      heroContext.strokeStyle = `rgba(245, 245, 245, ${opacity * 0.08})`;
      heroContext.lineWidth = 1;
      heroContext.beginPath();
      heroContext.moveTo(current.x, current.y);
      heroContext.lineTo(target.x, target.y);
      heroContext.stroke();
    }

    if (pointer.x !== null) {
      const pointerDistance = Math.hypot(current.x - pointer.x, current.y - pointer.y);
      if (pointerDistance < 170) {
        const pointerOpacity = 1 - pointerDistance / 170;
        heroContext.strokeStyle = `rgba(0, 255, 136, ${pointerOpacity * 0.28})`;
        heroContext.beginPath();
        heroContext.moveTo(current.x, current.y);
        heroContext.lineTo(pointer.x, pointer.y);
        heroContext.stroke();
      }
    }

    heroContext.fillStyle = "rgba(245, 245, 245, 0.55)";
    heroContext.beginPath();
    heroContext.arc(current.x, current.y, 1.6, 0, Math.PI * 2);
    heroContext.fill();
  }

  requestAnimationFrame(drawHeroBackground);
}

heroSection.addEventListener("pointermove", (event) => {
  const rect = heroSection.getBoundingClientRect();
  pointer.x = event.clientX - rect.left;
  pointer.y = event.clientY - rect.top;
});

heroSection.addEventListener("pointerleave", () => {
  pointer.x = null;
  pointer.y = null;
});

window.addEventListener("resize", resizeHeroCanvas);
resizeHeroCanvas();
drawHeroBackground();

function formatNumber(value) {
  if (typeof value !== "number") {
    return value;
  }
  return new Intl.NumberFormat("en-US").format(value);
}

function renderStats(container, stats) {
  container.innerHTML = stats
    .map(
      (stat) => `
        <div class="signal-stat">
          <span class="signal-key">${stat.label}</span>
          <strong>${stat.value}</strong>
        </div>
      `
    )
    .join("");
}

function renderChart(container, values) {
  container.innerHTML = values
    .map((value) => {
      const height = Math.max(10, value * 8);
      return `<span class="micro-bar" style="height:${height}px"></span>`;
    })
    .join("");
}

function renderHeatmap(container, values) {
  container.innerHTML = values
    .map((value) => `<span class="heat-cell level-${value}"></span>`)
    .join("");
}

function renderList(container, items) {
  container.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function loadGitHubData() {
  try {
    const [user, repos, events] = await Promise.all([
      fetchJson(`https://api.github.com/users/${profile.github}`),
      fetchJson(`https://api.github.com/users/${profile.github}/repos?per_page=100&sort=updated`),
      fetchJson(`https://api.github.com/users/${profile.github}/events/public?per_page=100`),
    ]);

    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const pushEvents = events.filter((event) => event.type === "PushEvent");
    const recentCommitCount = pushEvents.reduce((sum, event) => sum + (event.payload.commits || []).length, 0);

    renderStats(document.getElementById("github-summary"), [
      { label: "Repositories", value: formatNumber(user.public_repos) },
      { label: "Followers", value: formatNumber(user.followers) },
      { label: "Stars", value: formatNumber(totalStars) },
      { label: "Recent commits", value: formatNumber(recentCommitCount) },
    ]);

    const chartValues = pushEvents.slice(0, 12).reverse().map((event) => Math.max(1, (event.payload.commits || []).length));
    renderChart(document.getElementById("github-commit-chart"), chartValues.length > 0 ? chartValues : [1, 2, 1, 3, 2, 4, 3, 1]);

    const activityLines = pushEvents.slice(0, 4).map((event) => {
      const repoName = event.repo.name.split("/")[1];
      const commitCount = (event.payload.commits || []).length;
      return `${repoName}: ${commitCount} commit${commitCount === 1 ? "" : "s"} in latest push`;
    });
    renderList(document.getElementById("github-activity"), activityLines);

    const topRepos = repos
      .filter((repo) => !repo.fork)
      .sort((left, right) => {
        const scoreLeft = left.stargazers_count * 1000 + new Date(left.pushed_at).getTime() / 1e10;
        const scoreRight = right.stargazers_count * 1000 + new Date(right.pushed_at).getTime() / 1e10;
        return scoreRight - scoreLeft;
      })
      .slice(0, 6);

    const repoGrid = document.getElementById("repo-grid");
    repoGrid.innerHTML = topRepos
      .map((repo) => {
        const topics = (repo.topics || []).slice(0, 3);
        const skillSource = [repo.language || "", ...topics].filter(Boolean).join(",");
        return `
          <article class="repo-card" data-skills="${skillSource}">
            <div class="repo-top">
              <div>
                <p class="project-label">Repository</p>
                <h3>${repo.name}</h3>
              </div>
              <a href="${repo.html_url}" target="_blank" rel="noreferrer">Open</a>
            </div>
            <p>${repo.description || "No description provided yet."}</p>
            <div class="repo-meta">
              <span>Language: ${repo.language || "Mixed"}</span>
              <span>Stars: ${formatNumber(repo.stargazers_count)}</span>
              <span>Updated: ${new Date(repo.pushed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              <strong>Latest commit surface: ${repo.default_branch}</strong>
            </div>
          </article>
        `;
      })
      .join("");

    const commitTimelineValues = pushEvents.slice(0, 20).reverse().map((event) => Math.max(1, (event.payload.commits || []).length));
    renderChart(document.getElementById("commit-timeline"), commitTimelineValues.length > 0 ? commitTimelineValues : [1, 1, 2, 3, 2, 2, 4, 3]);

    logDebug("github_loaded", {
      repos: user.public_repos,
      followers: user.followers,
    });
  } catch (error) {
    renderList(document.getElementById("github-activity"), [
      "GitHub live fetch failed in the browser.",
      "The section falls back to static project links and local content.",
    ]);
    renderChart(document.getElementById("github-commit-chart"), [2, 1, 3, 4, 2, 3, 1, 2]);
    document.getElementById("repo-grid").innerHTML = `
      <article class="repo-card">
        <div class="repo-top">
          <div>
            <p class="project-label">Fallback</p>
            <h3>Repository feed unavailable</h3>
          </div>
        </div>
        <p>GitHub API access failed from this browser session. Existing project case studies remain available below.</p>
      </article>
    `;
    renderChart(document.getElementById("commit-timeline"), [1, 3, 2, 4, 2, 1, 2, 3]);
    logDebug("github_error", { message: error.message });
  }
}

async function loadCodeforcesData() {
  try {
    const [userInfoResult, ratingResult] = await Promise.all([
      fetchJson(`https://codeforces.com/api/user.info?handles=${profile.codeforces}`),
      fetchJson(`https://codeforces.com/api/user.rating?handle=${profile.codeforces}`),
    ]);

    const userInfo = userInfoResult.result[0];
    const ratings = ratingResult.result || [];
    const contests = ratings.slice(-3).reverse().map((contest) => {
      const delta = contest.newRating - contest.oldRating;
      const change = delta >= 0 ? `+${delta}` : `${delta}`;
      return `${contest.contestName}: ${contest.newRating} (${change})`;
    });

    renderStats(document.getElementById("codeforces-summary"), [
      { label: "Current rating", value: formatNumber(userInfo.rating || userInfo.maxRating || 0) },
      { label: "Max rating", value: formatNumber(userInfo.maxRating || userInfo.rating || 0) },
      { label: "Rank", value: userInfo.rank || "unrated" },
      { label: "Contests", value: formatNumber(ratings.length) },
    ]);

    renderList(document.getElementById("codeforces-contests"), contests.length > 0 ? contests : ["No recent contests found."]);
    logDebug("codeforces_loaded", { contests: ratings.length });
  } catch (error) {
    renderStats(document.getElementById("codeforces-summary"), [
      { label: "Current rating", value: "1305" },
      { label: "Max rating", value: "1305" },
      { label: "Rank", value: "pupil" },
      { label: "Contests", value: "snapshot" },
    ]);
    renderList(document.getElementById("codeforces-contests"), [
      "Live Codeforces fetch failed.",
      "Showing local profile snapshot instead.",
    ]);
    logDebug("codeforces_error", { message: error.message });
  }
}

async function loadLeetCodeData() {
  const summaryContainer = document.getElementById("leetcode-summary");
  const note = document.getElementById("leetcode-note");
  renderHeatmap(document.getElementById("leetcode-heatmap"), fallbackData.leetcode.heatmap);

  try {
    const body = {
      operationName: "userProfileCalendar",
      variables: { username: profile.leetcode },
      query: `
        query userProfileCalendar($username: String!) {
          matchedUser(username: $username) {
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
            profile {
              ranking
            }
            userCalendar {
              streak
              submissionCalendar
            }
          }
        }
      `,
    };

    const result = await fetchJson("https://leetcode.com/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const matchedUser = result.data && result.data.matchedUser;
    if (!matchedUser) {
      throw new Error("LeetCode user not returned");
    }

    const accepted = matchedUser.submitStatsGlobal.acSubmissionNum.find((item) => item.difficulty === "All");
    const submissionCalendar = JSON.parse(matchedUser.userCalendar.submissionCalendar || "{}");
    const values = Object.values(submissionCalendar)
      .slice(-56)
      .map((value) => {
        if (value === 0) {
          return 0;
        }
        if (value < 3) {
          return 1;
        }
        if (value < 6) {
          return 2;
        }
        if (value < 10) {
          return 3;
        }
        return 4;
      });

    renderStats(summaryContainer, [
      { label: "Solved", value: formatNumber(accepted.count) },
      { label: "Contest rank", value: formatNumber(matchedUser.profile.ranking || 0) },
      { label: "Status", value: "Live" },
      { label: "Streak", value: formatNumber(matchedUser.userCalendar.streak || 0) },
    ]);

    renderHeatmap(document.getElementById("leetcode-heatmap"), values.length > 0 ? values : fallbackData.leetcode.heatmap);
    note.textContent = "Live LeetCode data loaded from the profile endpoint.";
    logDebug("leetcode_loaded", { solved: accepted.count });
  } catch (error) {
    renderStats(summaryContainer, [
      { label: "Solved", value: `${fallbackData.leetcode.solved}+` },
      { label: "Contest rating", value: fallbackData.leetcode.rating },
      { label: "Status", value: "Snapshot" },
      { label: "Streak", value: `${fallbackData.leetcode.streak} days` },
    ]);
    note.textContent = fallbackData.leetcode.note;
    logDebug("leetcode_error", { message: error.message });
  }
}

function applySkillFilter(skill) {
  const filterValue = skill === "all" ? "all" : skill.toLowerCase();
  const projectCards = document.querySelectorAll(".project-card[data-skills]");
  const repoCards = document.querySelectorAll(".repo-card[data-skills]");
  const status = document.getElementById("skill-filter-status");

  document.querySelectorAll(".skill-node, .skill-chip").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.skill === skill);
  });

  [projectCards, repoCards].forEach((nodes) => {
    nodes.forEach((node) => {
      const skills = (node.dataset.skills || "").toLowerCase();
      const matches = filterValue === "all" || skills.includes(filterValue);
      node.classList.toggle("is-dim", !matches);
    });
  });

  status.textContent =
    skill === "all" ? "Showing all projects and repos." : `Filtering by ${skill}. Matching cards stay emphasized.`;
  logDebug("skill_filter", { skill });
}

document.querySelectorAll(".skill-node, .skill-chip").forEach((button) => {
  button.addEventListener("click", () => {
    applySkillFilter(button.dataset.skill);
  });
});

const terminalOutput = document.getElementById("terminal-output");
const terminalInput = document.getElementById("terminal-input");
const shortcutButtons = document.querySelectorAll(".terminal-shortcut");
const terminalHistory = [];
let historyIndex = -1;

const terminalCommands = {
  help: {
    description: "List available commands",
    run: () => [
      "Commands: help, tree, resume, github, leetcode, codeforces, projects, about, experience, contact, clear, pwd, ls, ls -la, cat, coffee, ascii, matrix, debug",
    ],
  },
  tree: {
    description: "Show profile structure",
    run: () => [
      ".",
      "|-- about.txt",
      "|-- achievements/",
      "|-- projects/",
      "|   |-- ecotrack.md",
      "|   |-- spam-detector.md",
      "|   `-- mini-search-engine.md",
      "|-- contact.txt",
      "`-- resume.pdf",
    ],
  },
  resume: {
    description: "Open resume modal",
    run: () => {
      openResume();
      return ["Opening resume preview..."];
    },
  },
  github: {
    description: "Open GitHub profile",
    run: () => {
      window.open(`https://github.com/${profile.github}`, "_blank", "noopener");
      return [`Opening github.com/${profile.github}`];
    },
  },
  leetcode: {
    description: "Open LeetCode profile",
    run: () => {
      window.open(`https://leetcode.com/u/${profile.leetcode}/`, "_blank", "noopener");
      return [`Opening leetcode.com/u/${profile.leetcode}`];
    },
  },
  codeforces: {
    description: "Open Codeforces profile",
    run: () => {
      window.open(`https://codeforces.com/profile/${profile.codeforces}`, "_blank", "noopener");
      return [`Opening codeforces.com/profile/${profile.codeforces}`];
    },
  },
  projects: {
    description: "Jump to projects section",
    run: () => {
      document.getElementById("projects").scrollIntoView({ behavior: "smooth" });
      return ["Jumping to projects section..."];
    },
  },
  about: {
    description: "Print short profile summary",
    run: () => [
      "Vedant Shendge",
      "Competitive Programmer / Full Stack Developer / Systems Enthusiast",
      "Technical Head @ ACM Student Chapter, VIIT Pune",
    ],
  },
  experience: {
    description: "Print leadership summary",
    run: () => [
      "Technical Head, ACM Student Chapter",
      "Organized 1000+ participant hackathon and led contest operations.",
    ],
  },
  contact: {
    description: "Print contact routes",
    run: () => [
      "Email: xyz@gmail.com",
      "GitHub: github.com/R3curs1on",
      "LinkedIn: linkedin.com/in/vedant-shendge",
    ],
  },
  clear: {
    description: "Clear terminal output",
    run: () => {
      terminalOutput.innerHTML = "";
      return [];
    },
  },
  pwd: {
    description: "Print current shell path",
    run: () => ["/portfolio/vedant"],
  },
  ls: {
    description: "List available files",
    run: (args) => {
      if (args[0] === "-la") {
        return [
          "drwxr-xr-x vedant achievements",
          "drwxr-xr-x vedant projects",
          "-rw-r--r-- vedant about.txt",
          "-rw-r--r-- vedant contact.txt",
          "-rw-r--r-- vedant resume.pdf",
        ];
      }
      return ["achievements  projects  about.txt  contact.txt  resume.pdf"];
    },
  },
  cat: {
    description: "Print file contents",
    run: (args) => {
      const file = args[0];
      if (!file) {
        return ["cat: missing file operand"];
      }
      const files = {
        "about.txt": "Third-year CS student at VIIT Pune. Technical Head @ ACM. Strong focus on DSA, systems, and product-minded engineering.",
        "contact.txt": "xyz@gmail.com\nGitHub: github.com/R3curs1on\nLinkedIn: linkedin.com/in/vedant-shendge",
        "resume.pdf": "[binary file] Use `resume` to preview it.",
      };
      return files[file] ? files[file].split("\n") : [`cat: ${file}: No such file or directory`];
    },
  },
  coffee: {
    description: "Print coffee",
    run: () => [
      "  ( (",
      "   ) )",
      "........",
      "|      |]",
      "\\      /",
      " `----'",
    ],
  },
  ascii: {
    description: "Toggle ASCII mode",
    run: () => {
      document.body.classList.toggle("ascii-mode");
      return [`ASCII mode ${document.body.classList.contains("ascii-mode") ? "enabled" : "disabled"}.`];
    },
  },
  matrix: {
    description: "Toggle matrix rain",
    run: () => {
      toggleMatrixMode();
      return [`Matrix mode ${document.body.classList.contains("matrix-mode") ? "enabled" : "disabled"}.`];
    },
  },
  debug: {
    description: "Open hidden debug page",
    run: () => {
      window.open("debug.html", "_blank", "noopener");
      return ["Opening debug route..."];
    },
  },
};

function printTerminalLine(text, kind = "terminal-line") {
  if (!text) {
    return;
  }
  const line = document.createElement("div");
  line.className = kind;
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function handleTerminalInput(rawInput) {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return;
  }

  terminalHistory.push(trimmed);
  historyIndex = terminalHistory.length;
  printTerminalLine(`vedant@portfolio:~$ ${trimmed}`, "terminal-line command");
  logDebug("terminal_command", { command: trimmed });

  const [commandName, ...args] = trimmed.split(/\s+/);
  const command = terminalCommands[commandName];

  if (!command) {
    printTerminalLine(`command not found: ${commandName}`, "terminal-line error");
    return;
  }

  const output = command.run(args);
  output.forEach((line) => {
    const kind = line.startsWith("Opening") ? "terminal-line info" : "terminal-line";
    printTerminalLine(line, kind);
  });
}

shortcutButtons.forEach((button) => {
  button.addEventListener("click", () => {
    handleTerminalInput(button.dataset.command);
  });
});

terminalInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleTerminalInput(terminalInput.value);
    terminalInput.value = "";
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (historyIndex > 0) {
      historyIndex -= 1;
      terminalInput.value = terminalHistory[historyIndex];
    }
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (historyIndex < terminalHistory.length - 1) {
      historyIndex += 1;
      terminalInput.value = terminalHistory[historyIndex];
    } else {
      historyIndex = terminalHistory.length;
      terminalInput.value = "";
    }
    return;
  }

  if (event.key === "Tab") {
    event.preventDefault();
    const current = terminalInput.value.trim();
    const matches = Object.keys(terminalCommands).filter((name) => name.startsWith(current));
    if (matches.length === 1) {
      terminalInput.value = matches[0];
    } else if (matches.length > 1) {
      printTerminalLine(matches.join("  "), "terminal-line info");
    }
  }
});

[
  "Interactive terminal ready.",
  "Type `help` to list commands.",
  "Try `matrix`, `ascii`, `tree`, or `debug`.",
].forEach((line) => printTerminalLine(line, "terminal-line success"));

const matrixCanvas = document.getElementById("matrixCanvas");
const matrixContext = matrixCanvas.getContext("2d");
let matrixColumns = [];
let matrixActive = false;

function resizeMatrix() {
  matrixCanvas.width = window.innerWidth * window.devicePixelRatio;
  matrixCanvas.height = window.innerHeight * window.devicePixelRatio;
  matrixCanvas.style.width = `${window.innerWidth}px`;
  matrixCanvas.style.height = `${window.innerHeight}px`;
  matrixContext.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  const fontSize = 16;
  const columnCount = Math.floor(window.innerWidth / fontSize);
  matrixColumns = Array.from({ length: columnCount }, () => Math.floor(Math.random() * window.innerHeight));
}

function drawMatrix() {
  if (matrixActive) {
    matrixContext.fillStyle = "rgba(5, 5, 5, 0.18)";
    matrixContext.fillRect(0, 0, window.innerWidth, window.innerHeight);
    matrixContext.fillStyle = "rgba(0, 255, 136, 0.9)";
    matrixContext.font = "16px JetBrains Mono";

    matrixColumns.forEach((value, index) => {
      const text = String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96));
      const x = index * 16;
      matrixContext.fillText(text, x, value);
      matrixColumns[index] = value > window.innerHeight + Math.random() * 1000 ? 0 : value + 16;
    });
  } else {
    matrixContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  requestAnimationFrame(drawMatrix);
}

function toggleMatrixMode() {
  matrixActive = !matrixActive;
  document.body.classList.toggle("matrix-mode", matrixActive);
  logDebug("matrix_toggle", { active: matrixActive });
}

window.addEventListener("resize", resizeMatrix);
resizeMatrix();
drawMatrix();

const konamiKeys = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
let konamiIndex = 0;

document.addEventListener("keydown", (event) => {
  const expected = konamiKeys[konamiIndex];
  if (event.key === expected) {
    konamiIndex += 1;
    if (konamiIndex === konamiKeys.length) {
      toggleMatrixMode();
      printTerminalLine("Konami sequence accepted. Matrix mode toggled.", "terminal-line success");
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

async function bootstrap() {
  await Promise.all([loadGitHubData(), loadCodeforcesData(), loadLeetCodeData()]);
  applySkillFilter("all");
}

bootstrap();
