# Деплой PDAI Calculator — skinlabpro.uz

> Ubuntu 22.04/24.04 LTS, Docker, Nginx, Let's Encrypt

## Структура на сервере

```
/home/calc/
├── app/                    # git repo
│   └── pdai-calculator/    # приложение (docker-compose, nginx, Dockerfile)
├── certbot/                # SSL-сертификаты (вне репо, персистентные)
│   ├── conf/
│   └── www/
└── logs/                   # логи nginx (access.log, error.log)
```

---

## 1. Подключение (root)

```bash
ssh root@146.190.140.126
apt update && apt upgrade -y
```

---

## 2. Новый пользователь

```bash
adduser calc
usermod -aG sudo calc
```

Проверка — **в новом терминале**:

```bash
ssh calc@146.190.140.126
sudo whoami
```

---

## 3. SSH-ключи

Три ключа для трёх связей:

| Ключ | Откуда → Куда | Назначение |
|---|---|---|
| `id_ed_calc` | Локальная машина → Сервер | Ручной SSH-доступ |
| `calc_ci` | GitHub Actions → Сервер | Автодеплой (CI/CD) |
| `calc_github` | Сервер → GitHub | git clone / git pull |

### 3.1. Локальная машина → Сервер

На **локальной машине**:

```bash
ssh-keygen -t ed25519 -C "calc@skinlabpro.uz" -f ~/.ssh/id_ed_calc
```

Копирование на сервер:

```bash
ssh-copy-id -i ~/.ssh/id_ed_calc.pub calc@146.190.140.126
```

Windows (если нет ssh-copy-id) — вручную:

```bash
# Локально — скопировать содержимое:
cat ~/.ssh/id_ed_calc.pub

# На сервере под calc:
mkdir -p ~/.ssh && chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Вставить ключ на новую строку
chmod 600 ~/.ssh/authorized_keys
```

Проверка — **в новом терминале**:

```bash
ssh -i ~/.ssh/id_ed_calc calc@146.190.140.126
```

Добавить в `~/.ssh/config` на локальной машине (если ещё нет):

```
Host calc
    HostName 146.190.140.126
    User calc
    IdentityFile ~/.ssh/id_ed_calc
```

После этого:

```bash
ssh calc
```

### 3.2. GitHub Actions → Сервер

На **локальной машине**:

```bash
ssh-keygen -t ed25519 -C "calc-ci" -f ~/.ssh/calc_ci -N ""
```

Публичный ключ — на сервер:

```bash
cat ~/.ssh/calc_ci.pub | ssh calc "cat >> ~/.ssh/authorized_keys"
```

Приватный ключ — в GitHub Secrets:

```bash
cat ~/.ssh/calc_ci
# Скопировать ВЕСЬ вывод (включая -----BEGIN/END-----)
```

GitHub → репозиторий → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Значение |
|---|---|
| `SERVER_HOST` | IP сервера |
| `SERVER_USER` | `calc` |
| `SERVER_SSH_KEY` | Содержимое `~/.ssh/calc_ci` (приватный ключ) |

### 3.3. Сервер → GitHub

На **сервере** под пользователем calc:

```bash
ssh-keygen -t ed25519 -C "calc-server" -f ~/.ssh/calc_github -N ""
cat ~/.ssh/calc_github.pub
# Скопировать вывод
```

GitHub → репозиторий → Settings → Deploy keys → Add deploy key:
- Title: `calc-vps`
- Key: содержимое `calc_github.pub`
- Allow write access: **нет**

Настроить SSH на сервере:

```bash
nano ~/.ssh/config
```

```
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/calc_github
    IdentitiesOnly yes
```

```bash
chmod 600 ~/.ssh/config
```

Проверка:

```bash
ssh -T git@github.com
```

### 3.4. Отключение пароля и root

**Только после проверки что ключ из п.3.1 работает!**

```bash
sudo nano /etc/ssh/sshd_config
```

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

```bash
sudo systemctl restart sshd
```

Проверка — **в новом терминале**:

```bash
ssh calc          # работает
ssh root@146.190.140.126     # Permission denied
```

---

## 4. Фаервол

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

---

## 5. Docker

```bash
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker calc
```

Перелогиниться:

```bash
exit
ssh calc
docker run hello-world
```

---

## 6. Клонирование

```bash
sudo apt install -y git
cd ~
git clone git@github.com:Meta-Psy/pdai_calc.git app
cd app/pdai-calculator
```

---

## 7. Сборка

```bash
cd ~/app/pdai-calculator
docker compose build
```

---

## 8. SSL-сертификат

> DNS A-записи `skinlabpro.uz` и `www.skinlabpro.uz` → IP сервера

```bash
nano init-letsencrypt.sh
# Поменять EMAIL на свой
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh
```

Скрипт автоматически создаст `~/certbot/` и `~/logs/`.

---

## 9. Запуск

```bash
docker compose up -d
docker compose ps
```

---

## 10. Права

```bash
sudo chown -R calc:calc ~/app ~/certbot ~/logs
find ~/app -type f -exec chmod 644 {} \;
find ~/app -type d -exec chmod 755 {} \;
chmod 755 ~/app/pdai-calculator/init-letsencrypt.sh
sudo chmod 600 ~/certbot/conf/live/skinlabpro.uz/privkey.pem
```

---

## 11. CI/CD (GitHub Actions)

Push в `master` → автодеплой.

Secrets настроены в п.3.2. Workflow: `.github/workflows/deploy.yml`.

Проверка: коммит в master → GitHub → Actions → деплой отработал.

---

## Справочник

```bash
cd ~/app/pdai-calculator
docker compose up -d                          # запуск
docker compose down                            # остановка
docker compose build && docker compose up -d   # пересборка
docker compose logs -f app                     # логи контейнера
docker compose logs certbot                    # логи certbot
docker compose run --rm certbot renew          # ручное обновление SSL
docker compose exec app nginx -s reload        # перезагрузка nginx
docker system prune -f                         # очистка

# Логи nginx на хосте
tail -f ~/logs/access.log
tail -f ~/logs/error.log
```

---

## Схема SSH-ключей

```
┌────────────┐  id_ed_calc  ┌────────────┐  calc_github  ┌──────────┐
│  Локальная │ ───────────→ │   Сервер   │ ───────────→  │  GitHub  │
│  машина    │              │  (calc@)   │               │  (repo)  │
└────────────┘              └────────────┘               └──────────┘
                                  ↑                           │
                                  │       calc_ci             │
                                  └───────────────────────────┘
                                    GitHub Actions → Сервер
```

---

## Чеклист

- [ ] Пользователь `calc` создан
- [ ] Ключ `id_ed_calc`: локальная → сервер, подключение работает
- [ ] Ключ `calc_ci`: GitHub Actions → сервер, добавлен в Secrets
- [ ] Ключ `calc_github`: сервер → GitHub, добавлен как Deploy Key
- [ ] `ssh -T git@github.com` на сервере работает
- [ ] Парольный вход и root-логин отключены
- [ ] UFW: открыты 22, 80, 443
- [ ] Docker установлен, calc в группе docker
- [ ] Репо склонировано в `~/app` через SSH
- [ ] DNS A-записи указывают на сервер
- [ ] SSL-сертификат получен
- [ ] Структура: `~/app`, `~/certbot`, `~/logs`
- [ ] `docker compose up -d` — сайт работает
- [ ] HTTPS редирект работает
- [ ] SPA fallback работает (обновление /en не даёт 404)
- [ ] Push в master → автодеплой через GitHub Actions
