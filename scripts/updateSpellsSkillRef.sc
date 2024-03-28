import $ivy.`com.github.tototoshi::scala-csv:1.3.10`
import $ivy.`io.circe::circe-yaml:0.14.2`
import $ivy.`io.circe::circe-generic:0.14.6`

import io.circe.yaml.parser.parse
import io.circe.Json
import io.circe.syntax._
import io.circe.yaml.Printer

import cats.syntax.option._

val SpellIcons = Map(
  "personal" -> "systems/oq/assets/icons/magic-swirl.svg",
  "divine"   -> "systems/oq/assets/icons/divided-spiral.svg",
  "sorcery"  -> "systems/oq/assets/icons/ink-swirl.svg"
)

val SkillReferences = Map(
  "personal" -> "personal-magic-casting",
  "sorcery" -> "sorcery-casting"
)

val YamlPrinter = Printer(preserveOrder = true, dropNullKeys = true)

def isSpell(filePath: os.Path, json: Json): Boolean = json
  .hcursor
  .downField("type")
  .as[String]
  .toOption
  .map(_ == "spell")
  .getOrElse(false)

def updateSpell(filePath: os.Path, json: Json): (os.Path, Json) =
//  val spellType = json.hcursor.downField("system").downField("type").as[String].toOption
//  val spellIcon = spellType.map(SpellIcons.apply)
//  val isDivine  = spellType.map(_ == "divine")
//
//  val result =
//    for {
//      newIcon   <- spellIcon
//      divine    <- isDivine
//      magnitude = json.hcursor.downField("system").downField("magnitude").as[Int].toOption.getOrElse(0)
//      updatedMagnitude =
//        if magnitude == 0 then
//          1
//        else
//          magnitude
//      updatedJson <-
//        json
//          .hcursor
//          .downField("img")
//          .set(newIcon.asJson)
//          .top
//      system = if magnitude != updatedMagnitude then Map("magnitude" -> updatedMagnitude.asJson) else Map.empty[String, Json]
//      divSystem = if divine then system ++ Map("remainingMagnitude" -> updatedMagnitude.asJson, "noMagicPoints" -> true.asJson) else system
//      _ = println(s"Div: ${divine}")
//      update = Map("system" -> divSystem.asJson).asJson
//    } yield updatedJson.deepMerge(update)

  val result = for {
    spellType <- json.hcursor.downField("system").downField("type").as[String].toOption
    skillRef <- SkillReferences.get(spellType)
    skillRefJson = Map("skillReference" -> skillRef.asJson).asJson
    system = Map("system" -> skillRefJson).asJson
  } yield json.deepMerge(system)


  filePath -> result.getOrElse(json)

def makeString(file: os.Path, json: Json): (os.Path, String) = file -> YamlPrinter.pretty(json)
def writeContent(file: os.Path, content: String)             = os.write.over(file, content)

@main
def updateSpells(packsPath: os.Path): Unit = os
  .walk(packsPath)
  .filter(os.isFile)
  .map(path => path -> os.read(path))
  .map { case (fileName, content) =>
    parse(content).map(c => fileName -> c)
  }
  .collect({ case Right(cnt) =>
    cnt
  })
  .filter(isSpell.tupled)
  .map(updateSpell.tupled)
  .map(makeString.tupled)
  .foreach(writeContent.tupled)
