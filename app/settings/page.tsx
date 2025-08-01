"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { Settings, useSettings } from "@/hooks/use-settings"
import { Locale } from "@/i18n/config"
import { setUserLocale } from "@/services/locale"
import {
  Eye16Regular,
  EyeOff16Regular,
  Save16Regular,
  Settings20Regular,
} from "@fluentui/react-icons"
import clsx from "clsx"
import { ExternalLink, Github } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"

import { version } from "@/lib/version"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const t = useTranslations() // default namespace (optional)
  const { setTheme, theme } = useTheme()
  const { settings, setSettings } = useSettings()
  const [keyVis, setKeyVis] = useState(false)
  const [isPending, startTransition] = useTransition()

  function languageChanged(value: string) {
    const locale = value as Locale
    startTransition(() => {
      setUserLocale(locale)
    })
  }

  function isSettings(object: Settings): object is Settings {
    return (
      typeof object === "object" &&
      typeof object.passwordLengthOne === "number" &&
      typeof object.passwordLengthTwo === "number" &&
      typeof object.encryptAlgo === "string"
    )
  }

  function Import(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files == null || event.target.files.length === 0) {
      alert("No file selected")
      return
    }
    const file = event.target.files[0] // get the selected file
    const reader = new FileReader() // create a FileReader object
    reader.onload = function (event) {
      const text: string = event.target?.result as string // get the file content as text
      const json: Settings = JSON.parse(text) // parse the text as JSON
      if (!isSettings(json)) {
        alert("Invalid file")
        return
      }
      localStorage.setItem("settings", JSON.stringify(json)) // store the JSON in localstorage
    }
    reader.readAsText(file) // read the file as text
  }

  function switchClick() {
    settings.hidePassword =
      document.getElementById("hide_pwr")?.ariaChecked != "true"
    setSettings(settings)
  }

  return (
    <div>
      <div className="mb-2 flex items-center space-x-2">
        <Settings20Regular primaryFill="#0088FF" className="text-white" />
        <p className="ml-2 font-bold">{t("settings")}</p>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-250 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("general")}</CardTitle>
              <CardDescription>{t("general-desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="theme">
                  {t("theme")}
                </Label>
                <div className="flex flex-wrap gap-2">
                  <div
                    onClick={() => setTheme("light")}
                    className={`flex cursor-pointer items-center space-x-2 overflow-hidden rounded-lg border-2 bg-slate-100 pr-2 dark:bg-slate-800 ${theme === "light" ? "border-accent" : "border-transparent"}`}
                  >
                    <Image
                      src="/LightTheme.png"
                      height={50}
                      width={50}
                      alt="Light theme image"
                      className="object-cover"
                    />
                    <p className="m-2 font-bold">{t("light")}</p>
                  </div>
                  <div
                    onClick={() => setTheme("dark")}
                    className={`flex cursor-pointer items-center space-x-2 overflow-hidden rounded-lg border-2 bg-slate-100 pr-2 dark:bg-slate-800 ${theme === "dark" ? "border-accent" : "border-transparent"}`}
                  >
                    <Image
                      src="/DarkTheme.png"
                      height={50}
                      width={50}
                      alt="Dark theme image"
                      className="object-cover"
                    />
                    <p className="m-2 font-bold">{t("dark")}</p>
                  </div>
                  <div
                    onClick={() => setTheme("system")}
                    className={`flex cursor-pointer items-center space-x-2 overflow-hidden rounded-lg border-2 bg-slate-100 pr-2 dark:bg-slate-800 ${theme === "system" ? "border-accent" : "border-transparent"}`}
                  >
                    <Image
                      src="/SystemTheme.png"
                      height={50}
                      width={50}
                      alt="System theme image"
                      className="object-cover"
                    />
                    <p className="m-2 font-bold">{t("system")}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="language" className="font-semibold">
                  {t("language")}
                </Label>
                <Select
                  defaultValue={t("lang")}
                  onValueChange={languageChanged}
                >
                  <SelectTrigger
                    className={clsx(
                      "h-auto w-[200px] px-2 py-1 sm:justify-self-end",
                      isPending && "pointer-events-none opacity-60"
                    )}
                  >
                    <SelectValue placeholder={t("language")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem defaultChecked={true} value="en">
                      English (United States)
                    </SelectItem>
                    <SelectItem value="fr">Français (France)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("password-config")}</CardTitle>
              <CardDescription>{t("password-default")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="col-end-1 mb-2 flex items-center space-x-2">
                <Switch
                  id="LowerChk"
                  onCheckedChange={() => {
                    if (settings.defaultPasswordConfig == null) {
                      settings.defaultPasswordConfig = {
                        upperCases: true,
                        lowerCases: true,
                        numbers: true,
                        special: false,
                      }
                    }
                    settings.defaultPasswordConfig.lowerCases =
                      !settings.defaultPasswordConfig.lowerCases
                    setSettings(settings)
                  }}
                  defaultChecked={
                    settings.defaultPasswordConfig
                      ? settings.defaultPasswordConfig.lowerCases
                      : true
                  }
                />
                <Label htmlFor="LowerChk">{t("lowercases")}</Label>
              </div>
              <div className="col-end-1 mb-2 flex items-center space-x-2">
                <Switch
                  onCheckedChange={() => {
                    if (settings.defaultPasswordConfig == null) {
                      settings.defaultPasswordConfig = {
                        upperCases: true,
                        lowerCases: true,
                        numbers: true,
                        special: false,
                      }
                    }
                    settings.defaultPasswordConfig.upperCases =
                      !settings.defaultPasswordConfig.upperCases
                    setSettings(settings)
                  }}
                  defaultChecked={
                    settings.defaultPasswordConfig
                      ? settings.defaultPasswordConfig.upperCases
                      : true
                  }
                  id="UpperChk"
                />
                <Label htmlFor="UpperChk">{t("uppercases")}</Label>
              </div>
              <div className="col-end-1 mb-2 flex items-center space-x-2">
                <Switch
                  onCheckedChange={() => {
                    if (settings.defaultPasswordConfig == null) {
                      settings.defaultPasswordConfig = {
                        upperCases: true,
                        lowerCases: true,
                        numbers: true,
                        special: false,
                      }
                    }
                    settings.defaultPasswordConfig.numbers =
                      !settings.defaultPasswordConfig.numbers
                    setSettings(settings)
                  }}
                  defaultChecked={
                    settings.defaultPasswordConfig
                      ? settings.defaultPasswordConfig.numbers
                      : true
                  }
                  id="NbrChk"
                />
                <Label htmlFor="NbrChk">{t("nbrs")}</Label>
              </div>
              <div className="col-end-1 mb-2 flex items-center space-x-2">
                <Switch
                  id="SpecialChk"
                  onCheckedChange={() => {
                    if (settings.defaultPasswordConfig == null) {
                      settings.defaultPasswordConfig = {
                        upperCases: true,
                        lowerCases: true,
                        numbers: true,
                        special: false,
                      }
                    }
                    settings.defaultPasswordConfig.special =
                      !settings.defaultPasswordConfig.special
                    setSettings(settings)
                  }}
                  defaultChecked={
                    settings.defaultPasswordConfig
                      ? settings.defaultPasswordConfig.special
                      : false
                  }
                />
                <Label htmlFor="SpecialChk">{t("specialchars")}</Label>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("password-settings")}</CardTitle>
              <CardDescription>{t("password-settings-desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <h5 className="font-bold">{t("default-random-length")}</h5>
              <div className="flex items-center gap-2">
                <p>{t("between")}</p>
                <Input
                  defaultValue={settings.passwordLengthOne}
                  type="number"
                  className="h-auto w-14 px-2 py-1"
                  id="Num1Txt"
                  onChange={() => {
                    settings.passwordLengthOne = parseInt(
                      (document.getElementById("Num1Txt") as HTMLInputElement)
                        .value
                    )
                    setSettings(settings)
                  }}
                />
                <p>{t("and")}</p>
                <Input
                  defaultValue={settings.passwordLengthTwo}
                  type="number"
                  className="h-auto w-14 px-2 py-1"
                  id="Num2Txt"
                  onChange={() => {
                    settings.passwordLengthTwo = parseInt(
                      (document.getElementById("Num2Txt") as HTMLInputElement)
                        .value
                    )
                    setSettings(settings)
                  }}
                />
              </div>
              <br />
              <h5 className="font-bold">{t("custom-chars")}</h5>
              <p>{t("uppercases")}</p>
              <Input
                defaultValue={settings.customChars.upperCases}
                className="mt-2 h-auto px-2 py-1"
                id="UpperTextArea"
                onChange={() => {
                  settings.customChars.upperCases = (
                    document.getElementById("UpperTextArea") as HTMLInputElement
                  ).value
                  setSettings(settings)
                }}
              />
              <p>{t("lowercases")}</p>
              <Input
                defaultValue={settings.customChars.lowerCases}
                className="mt-2 h-auto px-2 py-1"
                id="LowerTextArea"
                onChange={() => {
                  settings.customChars.lowerCases = (
                    document.getElementById("LowerTextArea") as HTMLInputElement
                  ).value
                  setSettings(settings)
                }}
              />
              <p>{t("nbrs")}</p>
              <Input
                defaultValue={settings.customChars.numbers}
                className="mt-2 h-auto px-2 py-1"
                id="NumbersTextArea"
                onChange={() => {
                  settings.customChars.numbers = (
                    document.getElementById(
                      "NumbersTextArea"
                    ) as HTMLInputElement
                  ).value
                  setSettings(settings)
                }}
              />
              <p>{t("specialchars")}</p>
              <Input
                defaultValue={settings.customChars.special}
                className="mt-2 h-auto px-2 py-1"
                id="SpecialTextArea"
                onChange={() => {
                  settings.customChars.special = (
                    document.getElementById(
                      "SpecialTextArea"
                    ) as HTMLInputElement
                  ).value
                  setSettings(settings)
                }}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("security")}</CardTitle>
              <CardDescription>{t("security-desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="hide_pwr">{t("hide-password")}</Label>
                <Switch
                  onClick={switchClick}
                  defaultChecked={
                    settings.hidePassword != null &&
                    settings.hidePassword != undefined
                      ? settings.hidePassword
                      : false
                  }
                  className="sm:justify-self-end"
                  id="hide_pwr"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="hashing"> {t("default-hashing-algo")}</Label>
                <Select
                  defaultValue={settings.hashAlgo}
                  onValueChange={(val) => {
                    settings.hashAlgo = val
                    setSettings(settings)
                  }}
                >
                  <SelectTrigger
                    id="hashing"
                    className="mx-1 h-auto w-[200px] px-2 py-1 sm:justify-self-end"
                  >
                    <SelectValue placeholder={t("algorithm")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem defaultChecked={true} value="md5">
                      MD5
                    </SelectItem>
                    <SelectItem value="sha-1">SHA-1</SelectItem>
                    <SelectItem value="sha-256">SHA-256</SelectItem>
                    <SelectItem value="sha-512">SHA-512</SelectItem>
                    <SelectItem value="sha-3">SHA-3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="encryption">
                  {t("default-encryption-algo")}
                </Label>
                <Select
                  defaultValue={settings.encryptAlgo}
                  onValueChange={(val) => {
                    settings.encryptAlgo = val
                    setSettings(settings)
                  }}
                >
                  <SelectTrigger
                    id="encryption"
                    className="mx-1 h-auto w-[200px] px-2 py-1 sm:justify-self-end"
                  >
                    <SelectValue placeholder={t("algorithm")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem defaultChecked={true} value="aes">
                      AES
                    </SelectItem>
                    <SelectItem value="3des">3DES</SelectItem>
                    <SelectItem value="rabbit">Rabbit</SelectItem>
                    <SelectItem value="rc4">RC4Drop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("ai")}</CardTitle>
              <CardDescription>{t("ai-desc")}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                type={keyVis ? "text" : "password"}
                id="api-key"
                className="h-auto max-w-[50%] px-2 py-1"
                defaultValue={settings.openaiKey ?? ""}
              />
              <Button
                onClick={() => {
                  settings.openaiKey = (
                    document.getElementById("api-key") as HTMLInputElement
                  ).value
                  setSettings(settings)
                }}
                className="h-auto px-2 py-1"
              >
                <Save16Regular />
              </Button>
              <Button
                className="h-auto px-2 py-1"
                onClick={() => setKeyVis(!keyVis)}
                variant="outline"
              >
                {keyVis ? <Eye16Regular /> : <EyeOff16Regular />}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("about")}</CardTitle>
              <CardDescription>{t("about-desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{t("version")}</h3>
                <p>Passliss v{version}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{t("repository")}</h3>
                <a
                  href="https://github.com/Leo-Corporation/Passliss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary flex items-center hover:underline"
                >
                  <Github className="mr-2 size-4" />
                  {t("view-repository")}
                  <ExternalLink className="ml-2 size-4" />
                </a>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{t("licenses")}</h3>
                <p>
                  NextJS - MIT License - © 2025 Vercel, Inc.
                  <br></br>
                  RadixUI - MIT License - © 2022 WorkOS
                  <br></br>
                  shadcn/ui - MIT License - © 2023 shadcn
                  <br></br>
                  Fluent System Icons - MIT License - © 2020 Microsoft
                  Corporation
                  <br></br>
                  Passliss - MIT License - © 2021-{new Date().getFullYear()}{" "}
                  Léo Corporation
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("data")}</CardTitle>
              <CardDescription>{t("manage-data")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Link
                  className={buttonVariants({
                    variant: "default",
                    size: "nav",
                    className: "text-center",
                  })}
                  href={
                    "data:text/plain;charset=UTF-8," +
                    encodeURIComponent(
                      typeof window !== "undefined"
                        ? (localStorage.getItem("settings") ?? "")
                        : "{msg: 'an error occurred'}"
                    )
                  }
                  download={"settings.json"}
                >
                  {t("export-settings")}
                </Link>
                <Button
                  variant="outline"
                  size="nav"
                  onClick={() =>
                    (
                      document.getElementById(
                        "FileSelector"
                      ) as HTMLInputElement
                    ).click()
                  }
                >
                  {t("import-settings")}
                </Button>
                <Input
                  type="file"
                  id="FileSelector"
                  accept="application/json"
                  className="hidden"
                  onChange={Import}
                ></Input>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="h-auto px-2 py-1 font-bold"
                      variant="destructive"
                    >
                      {t("reset-settings")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("reset-settings")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("reset-settings-msg")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction
                        onClick={() => {
                          setTheme("system")
                          localStorage.setItem(
                            "settings",
                            JSON.stringify({
                              // default object
                              passwordLengthOne: 12,
                              passwordLengthTwo: 19,
                              encryptAlgo: "aes",
                              customChars: {
                                lowerCases: "abcdefghijklmnopqrstuvwxyz",
                                upperCases: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                                numbers: "01234567889",
                                special: ";:!/§ù*$%µ£)=(+*-&é'(-è_ç<>?^¨",
                              },
                            })
                          )
                        }}
                      >
                        {t("continue")}
                      </AlertDialogAction>
                      <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
