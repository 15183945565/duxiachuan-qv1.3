import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';

const projectRoot = path.resolve(import.meta.dirname, '..');
const packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'),
);
const creatorVersion = packageJson.creator?.version;
const creatorTypeScriptPath = path.join(
    process.env.ProgramData || 'C:\\ProgramData',
    'cocos',
    'editors',
    'Creator',
    creatorVersion,
    'resources',
    'app.asar.unpacked',
    'node_modules',
    'typescript',
    'lib',
    'typescript.js',
);
if (!fs.existsSync(creatorTypeScriptPath)) {
    console.error(`Home architecture audit failed: TypeScript API missing at ${creatorTypeScriptPath}`);
    process.exit(1);
}

const require = createRequire(import.meta.url);
const ts = require(creatorTypeScriptPath);
const homeDirectory = path.join(projectRoot, 'assets', 'Script', 'UI', 'Home');
const lineBudgets = {
    'HomeViewBase.ts': 1140,
    'HomeViewRoleBag.ts': 760,
    'HomeViewAdventure.ts': 500,
    'HomeBeastStrengthenConfig.ts': 80,
    'HomeFeatureAssetRuntime.ts': 330,
    'HomeFeatureBag.ts': 900,
    'HomeFeatureBattleChallenge.ts': 420,
    'HomeFeatureBattleCombat.ts': 550,
    'HomeFeatureBattleEntry.ts': 390,
    'HomeFeatureBattleLifecycle.ts': 170,
    'HomeFeatureBattleReward.ts': 310,
    'HomeFeatureBattleUpgrade.ts': 310,
    'HomeFeatureBeastCardPresentation.ts': 440,
    'HomeFeatureBeastCardRecord.ts': 420,
    'HomeFeatureBeastCardShell.ts': 300,
    'HomeFeatureBeastStrengthenInteraction.ts': 460,
    'HomeFeatureBeastStrengthenPage.ts': 470,
    'HomeFeatureBeastStrengthenRules.ts': 230,
    'HomeFeatureBottomFeatureShell.ts': 330,
    'HomeFeatureCharacter.ts': 230,
    'HomeFeatureCharacterCreationUI.ts': 500,
    'HomeFeatureCommerceConfirm.ts': 400,
    'HomeFeatureDuelActorRuntime.ts': 800,
    'HomeFeatureDuelInvest.ts': 280,
    'HomeFeatureDuelLobby.ts': 250,
    'HomeFeatureDuelRank.ts': 450,
    'HomeFeatureDuelRecord.ts': 430,
    'HomeFeatureDuelRoundClock.ts': 110,
    'HomeFeatureDuelRoundResolution.ts': 230,
    'HomeFeatureDuelSceneUI.ts': 800,
    'HomeFeatureGiftShare.ts': 150,
    'HomeFeatureHomeUIRoot.ts': 280,
    'HomeFeatureHomeSceneShell.ts': 210,
    'HomeFeatureItemDetail.ts': 520,
    'HomeFeatureMagicBattle.ts': 380,
    'HomeFeatureMagicBattleDamage.ts': 540,
    'HomeFeatureMagicBattleDuel.ts': 520,
    'HomeFeatureMagicMap.ts': 800,
    'HomeFeatureMagicScene.ts': 650,
    'HomeFeatureMailData.ts': 130,
    'HomeFeatureMailDetail.ts': 400,
    'HomeFeatureMailPanel.ts': 500,
    'HomeFeatureMarketSell.ts': 600,
    'HomeFeatureMarketShell.ts': 630,
    'HomeFeatureMarketTrade.ts': 330,
    'HomeFeatureNotice.ts': 350,
    'HomeFeatureProfileAvatarFrame.ts': 450,
    'HomeFeatureProfileSettings.ts': 340,
    'HomeFeatureProfileShell.ts': 440,
    'HomeFeatureRank.ts': 400,
    'HomeFeatureRoleAdvance.ts': 650,
    'HomeFeatureRoleDisplay.ts': 180,
    'HomeFeatureRoleEquipment.ts': 900,
    'HomeFeatureRoleProgression.ts': 250,
    'HomeFeatureRoleStrengthen.ts': 520,
    'HomeFeatureRoleVisualRuntime.ts': 180,
    'HomeFeatureShop.ts': 550,
    'HomeFeatureShowcase.ts': 300,
    'HomeFeatureToast.ts': 160,
    'HomeFeatureTransitionLoading.ts': 130,
    'HomeFeatureWorldMovement.ts': 160,
};

function fail(message) {
    console.error(`Home architecture audit failed: ${message}`);
    process.exit(1);
}

function parseSource(fileName) {
    const filePath = path.join(homeDirectory, fileName);
    const source = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
        filePath,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
    );
    return { source, sourceFile };
}

for (const [fileName, maximumLines] of Object.entries(lineBudgets)) {
    const lineCount = fs.readFileSync(path.join(homeDirectory, fileName), 'utf8').split(/\r?\n/).length;
    if (lineCount > maximumLines) {
        fail(`${fileName} grew to ${lineCount} lines (budget ${maximumLines}); extract a feature module`);
    }
}

function parseStatelessFeature(fileName, className) {
    const parsed = parseSource(fileName);
    const classNode = parsed.sourceFile.statements.find(
        (statement) => ts.isClassDeclaration(statement)
            && statement.name?.text === className,
    );
    if (!classNode) fail(`${className} class not found`);
    const fields = classNode.members.filter(
        (member) => ts.isPropertyDeclaration(member),
    );
    if (fields.length > 0) {
        fail(`${className} must remain stateless; found ${fields.length} field declaration(s)`);
    }
    return { ...parsed, classNode };
}

const mailData = parseStatelessFeature('HomeFeatureMailData.ts', 'HomeFeatureMailData');
const mailPanel = parseStatelessFeature('HomeFeatureMailPanel.ts', 'HomeFeatureMailPanel');
const mailDetail = parseStatelessFeature('HomeFeatureMailDetail.ts', 'HomeFeatureMailDetail');
const marketShell = parseStatelessFeature('HomeFeatureMarketShell.ts', 'HomeFeatureMarketShell');
const marketSell = parseStatelessFeature('HomeFeatureMarketSell.ts', 'HomeFeatureMarketSell');
const marketTrade = parseStatelessFeature('HomeFeatureMarketTrade.ts', 'HomeFeatureMarketTrade');
const shop = parseStatelessFeature('HomeFeatureShop.ts', 'HomeFeatureShop');
const profileShell = parseStatelessFeature('HomeFeatureProfileShell.ts', 'HomeFeatureProfileShell');
const profileAvatarFrame = parseStatelessFeature('HomeFeatureProfileAvatarFrame.ts', 'HomeFeatureProfileAvatarFrame');
const profileSettings = parseStatelessFeature('HomeFeatureProfileSettings.ts', 'HomeFeatureProfileSettings');
const homeUIRoot = parseStatelessFeature('HomeFeatureHomeUIRoot.ts', 'HomeFeatureHomeUIRoot');
const homeSceneShell = parseStatelessFeature('HomeFeatureHomeSceneShell.ts', 'HomeFeatureHomeSceneShell');
const assetRuntime = parseStatelessFeature('HomeFeatureAssetRuntime.ts', 'HomeFeatureAssetRuntime');
const roleVisualRuntime = parseStatelessFeature('HomeFeatureRoleVisualRuntime.ts', 'HomeFeatureRoleVisualRuntime');
const worldMovement = parseStatelessFeature('HomeFeatureWorldMovement.ts', 'HomeFeatureWorldMovement');
const toast = parseStatelessFeature('HomeFeatureToast.ts', 'HomeFeatureToast');

const notice = parseSource('HomeFeatureNotice.ts');
const noticeClass = notice.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureNotice',
);
if (!noticeClass) fail('HomeFeatureNotice class not found');
const noticeFields = noticeClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (noticeFields.length > 0) {
    fail(
        'HomeFeatureNotice must remain stateless; '
        + `found ${noticeFields.length} field declaration(s)`,
    );
}

const rank = parseSource('HomeFeatureRank.ts');
const rankClass = rank.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureRank',
);
if (!rankClass) fail('HomeFeatureRank class not found');
const rankFields = rankClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (rankFields.length > 0) {
    fail(
        'HomeFeatureRank must remain stateless; '
        + `found ${rankFields.length} field declaration(s)`,
    );
}

const roleBag = parseSource('HomeViewRoleBag.ts');
const roleBagClass = roleBag.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeViewRoleBag',
);
if (!roleBagClass) fail('HomeViewRoleBag class not found');

const duelLobby = parseSource('HomeFeatureDuelLobby.ts');
const duelLobbyClass = duelLobby.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureDuelLobby',
);
if (!duelLobbyClass) fail('HomeFeatureDuelLobby class not found');
const duelLobbyFields = duelLobbyClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (duelLobbyFields.length > 0) {
    fail(
        'HomeFeatureDuelLobby must remain stateless; '
        + `found ${duelLobbyFields.length} field declaration(s)`,
    );
}

const duelRecord = parseSource('HomeFeatureDuelRecord.ts');
const duelRecordClass = duelRecord.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureDuelRecord',
);
if (!duelRecordClass) fail('HomeFeatureDuelRecord class not found');
const duelRecordFields = duelRecordClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (duelRecordFields.length > 0) {
    fail(
        'HomeFeatureDuelRecord must remain stateless; '
        + `found ${duelRecordFields.length} field declaration(s)`,
    );
}

const duelRank = parseSource('HomeFeatureDuelRank.ts');
const duelRankClass = duelRank.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureDuelRank',
);
if (!duelRankClass) fail('HomeFeatureDuelRank class not found');
const duelRankFields = duelRankClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (duelRankFields.length > 0) {
    fail(
        'HomeFeatureDuelRank must remain stateless; '
        + `found ${duelRankFields.length} field declaration(s)`,
    );
}

const duelInvest = parseSource('HomeFeatureDuelInvest.ts');
const duelInvestClass = duelInvest.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureDuelInvest',
);
if (!duelInvestClass) fail('HomeFeatureDuelInvest class not found');
const duelInvestFields = duelInvestClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (duelInvestFields.length > 0) {
    fail(
        'HomeFeatureDuelInvest must remain stateless; '
        + `found ${duelInvestFields.length} field declaration(s)`,
    );
}

const duelRoundClock = parseSource('HomeFeatureDuelRoundClock.ts');
const duelRoundClockClass = duelRoundClock.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureDuelRoundClock',
);
if (!duelRoundClockClass) fail('HomeFeatureDuelRoundClock class not found');
const duelRoundClockFields = duelRoundClockClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (duelRoundClockFields.length > 0) {
    fail(
        'HomeFeatureDuelRoundClock must remain stateless; '
        + `found ${duelRoundClockFields.length} field declaration(s)`,
    );
}

const duelRoundResolution = parseSource('HomeFeatureDuelRoundResolution.ts');
const duelRoundResolutionClass = duelRoundResolution.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureDuelRoundResolution',
);
if (!duelRoundResolutionClass) fail('HomeFeatureDuelRoundResolution class not found');
const duelRoundResolutionFields = duelRoundResolutionClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (duelRoundResolutionFields.length > 0) {
    fail(
        'HomeFeatureDuelRoundResolution must remain stateless; '
        + `found ${duelRoundResolutionFields.length} field declaration(s)`,
    );
}

const duelActorRuntime = parseSource('HomeFeatureDuelActorRuntime.ts');
const duelActorRuntimeClass = duelActorRuntime.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureDuelActorRuntime',
);
if (!duelActorRuntimeClass) fail('HomeFeatureDuelActorRuntime class not found');
const duelActorRuntimeFields = duelActorRuntimeClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (duelActorRuntimeFields.length > 0) {
    fail(
        'HomeFeatureDuelActorRuntime must keep state in the RoleBag initializer; '
        + `found ${duelActorRuntimeFields.length} field declaration(s)`,
    );
}

const duelSceneUI = parseSource('HomeFeatureDuelSceneUI.ts');
const duelSceneUIClass = duelSceneUI.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureDuelSceneUI',
);
if (!duelSceneUIClass) fail('HomeFeatureDuelSceneUI class not found');
const duelSceneUIFields = duelSceneUIClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (duelSceneUIFields.length > 0) {
    fail(
        'HomeFeatureDuelSceneUI must keep state in the RoleBag initializer; '
        + `found ${duelSceneUIFields.length} field declaration(s)`,
    );
}

const showcase = parseSource('HomeFeatureShowcase.ts');
const showcaseClass = showcase.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureShowcase',
);
if (!showcaseClass) fail('HomeFeatureShowcase class not found');
const showcaseFields = showcaseClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (showcaseFields.length > 0) {
    fail(
        'HomeFeatureShowcase must remain stateless; '
        + `found ${showcaseFields.length} field declaration(s)`,
    );
}

const itemDetail = parseSource('HomeFeatureItemDetail.ts');
const itemDetailClass = itemDetail.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureItemDetail',
);
if (!itemDetailClass) fail('HomeFeatureItemDetail class not found');
const itemDetailFields = itemDetailClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (itemDetailFields.length > 0) {
    fail(
        'HomeFeatureItemDetail must remain stateless; '
        + `found ${itemDetailFields.length} field declaration(s)`,
    );
}

const commerceConfirm = parseSource('HomeFeatureCommerceConfirm.ts');
const commerceConfirmClass = commerceConfirm.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureCommerceConfirm',
);
if (!commerceConfirmClass) fail('HomeFeatureCommerceConfirm class not found');
const commerceConfirmFields = commerceConfirmClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (commerceConfirmFields.length > 0) {
    fail(
        'HomeFeatureCommerceConfirm must keep quantity state in HomeViewBase; '
        + `found ${commerceConfirmFields.length} field declaration(s)`,
    );
}

const bag = parseSource('HomeFeatureBag.ts');
const bagClass = bag.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureBag',
);
if (!bagClass) fail('HomeFeatureBag class not found');
const bagFields = bagClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (bagFields.length > 0) {
    fail(
        'HomeFeatureBag must keep state in Base/RoleBag initializers; '
        + `found ${bagFields.length} field declaration(s)`,
    );
}

const roleEquipment = parseSource('HomeFeatureRoleEquipment.ts');
const roleEquipmentClass = roleEquipment.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureRoleEquipment',
);
if (!roleEquipmentClass) fail('HomeFeatureRoleEquipment class not found');
const roleEquipmentFields = roleEquipmentClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (roleEquipmentFields.length > 0) {
    fail(
        'HomeFeatureRoleEquipment must keep state in Base/RoleBag initializers; '
        + `found ${roleEquipmentFields.length} field declaration(s)`,
    );
}

const roleProgression = parseSource('HomeFeatureRoleProgression.ts');
const roleProgressionClass = roleProgression.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureRoleProgression',
);
if (!roleProgressionClass) fail('HomeFeatureRoleProgression class not found');
const roleProgressionFields = roleProgressionClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (roleProgressionFields.length > 0) {
    fail(
        'HomeFeatureRoleProgression must keep state in Base/RoleBag initializers; '
        + `found ${roleProgressionFields.length} field declaration(s)`,
    );
}

const roleAdvance = parseSource('HomeFeatureRoleAdvance.ts');
const roleAdvanceClass = roleAdvance.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureRoleAdvance',
);
if (!roleAdvanceClass) fail('HomeFeatureRoleAdvance class not found');
const roleAdvanceFields = roleAdvanceClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (roleAdvanceFields.length > 0) {
    fail(
        'HomeFeatureRoleAdvance must keep state in Base/RoleBag initializers; '
        + `found ${roleAdvanceFields.length} field declaration(s)`,
    );
}

const roleStrengthen = parseSource('HomeFeatureRoleStrengthen.ts');
const roleStrengthenClass = roleStrengthen.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureRoleStrengthen',
);
if (!roleStrengthenClass) fail('HomeFeatureRoleStrengthen class not found');
const roleStrengthenFields = roleStrengthenClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (roleStrengthenFields.length > 0) {
    fail(
        'HomeFeatureRoleStrengthen must keep state in Base/RoleBag initializers; '
        + `found ${roleStrengthenFields.length} field declaration(s)`,
    );
}

const roleDisplay = parseSource('HomeFeatureRoleDisplay.ts');
const roleDisplayClass = roleDisplay.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureRoleDisplay',
);
if (!roleDisplayClass) fail('HomeFeatureRoleDisplay class not found');
const roleDisplayFields = roleDisplayClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (roleDisplayFields.length > 0) {
    fail(
        'HomeFeatureRoleDisplay must remain stateless; '
        + `found ${roleDisplayFields.length} field declaration(s)`,
    );
}

const transitionLoading = parseSource('HomeFeatureTransitionLoading.ts');
const transitionLoadingClass = transitionLoading.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureTransitionLoading',
);
if (!transitionLoadingClass) fail('HomeFeatureTransitionLoading class not found');
const transitionLoadingFields = transitionLoadingClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (transitionLoadingFields.length > 0) {
    fail(
        'HomeFeatureTransitionLoading must keep state in HomeViewBase; '
        + `found ${transitionLoadingFields.length} field declaration(s)`,
    );
}

const bottomFeatureShell = parseSource('HomeFeatureBottomFeatureShell.ts');
const bottomFeatureShellClass = bottomFeatureShell.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureBottomFeatureShell',
);
if (!bottomFeatureShellClass) fail('HomeFeatureBottomFeatureShell class not found');
const bottomFeatureShellFields = bottomFeatureShellClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (bottomFeatureShellFields.length > 0) {
    fail(
        'HomeFeatureBottomFeatureShell must keep state in Base/Adventure initializers; '
        + `found ${bottomFeatureShellFields.length} field declaration(s)`,
    );
}

const magicScene = parseSource('HomeFeatureMagicScene.ts');
const magicSceneClass = magicScene.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureMagicScene',
);
if (!magicSceneClass) fail('HomeFeatureMagicScene class not found');
const magicSceneFields = magicSceneClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (magicSceneFields.length > 0) {
    fail(
        'HomeFeatureMagicScene must keep state in Base/Adventure initializers; '
        + `found ${magicSceneFields.length} field declaration(s)`,
    );
}

const magicMap = parseSource('HomeFeatureMagicMap.ts');
const magicMapClass = magicMap.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureMagicMap',
);
if (!magicMapClass) fail('HomeFeatureMagicMap class not found');
const magicMapFields = magicMapClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (magicMapFields.length > 0) {
    fail(
        'HomeFeatureMagicMap must keep state in HomeViewBase; '
        + `found ${magicMapFields.length} field declaration(s)`,
    );
}

const magicBattleDamage = parseSource('HomeFeatureMagicBattleDamage.ts');
const magicBattleDamageClass = magicBattleDamage.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureMagicBattleDamage',
);
if (!magicBattleDamageClass) fail('HomeFeatureMagicBattleDamage class not found');
const magicBattleDamageFields = magicBattleDamageClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (magicBattleDamageFields.length > 0) {
    fail(
        'HomeFeatureMagicBattleDamage must keep state in Adventure initializer; '
        + `found ${magicBattleDamageFields.length} field declaration(s)`,
    );
}

const magicBattleDuel = parseSource('HomeFeatureMagicBattleDuel.ts');
const magicBattleDuelClass = magicBattleDuel.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureMagicBattleDuel',
);
if (!magicBattleDuelClass) fail('HomeFeatureMagicBattleDuel class not found');
const magicBattleDuelFields = magicBattleDuelClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (magicBattleDuelFields.length > 0) {
    fail(
        'HomeFeatureMagicBattleDuel must keep state in Adventure initializer; '
        + `found ${magicBattleDuelFields.length} field declaration(s)`,
    );
}

const magicBattle = parseSource('HomeFeatureMagicBattle.ts');
const magicBattleClass = magicBattle.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureMagicBattle',
);
if (!magicBattleClass) fail('HomeFeatureMagicBattle class not found');
const magicBattleFields = magicBattleClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (magicBattleFields.length > 0) {
    fail(
        'HomeFeatureMagicBattle must keep state in Base/Adventure initializers; '
        + `found ${magicBattleFields.length} field declaration(s)`,
    );
}

const beastStrengthenRules = parseSource('HomeFeatureBeastStrengthenRules.ts');
const beastStrengthenRulesClass = beastStrengthenRules.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureBeastStrengthenRules',
);
if (!beastStrengthenRulesClass) fail('HomeFeatureBeastStrengthenRules class not found');
const beastStrengthenRulesFields = beastStrengthenRulesClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (beastStrengthenRulesFields.length > 0) {
    fail(
        'HomeFeatureBeastStrengthenRules must keep state in Adventure initializer; '
        + `found ${beastStrengthenRulesFields.length} field declaration(s)`,
    );
}

const beastCardPresentation = parseSource('HomeFeatureBeastCardPresentation.ts');
const beastCardPresentationClass = beastCardPresentation.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureBeastCardPresentation',
);
if (!beastCardPresentationClass) fail('HomeFeatureBeastCardPresentation class not found');
const beastCardPresentationFields = beastCardPresentationClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (beastCardPresentationFields.length > 0) {
    fail(
        'HomeFeatureBeastCardPresentation must keep state in Base/Adventure initializers; '
        + `found ${beastCardPresentationFields.length} field declaration(s)`,
    );
}

const beastCardRecord = parseSource('HomeFeatureBeastCardRecord.ts');
const beastCardRecordClass = beastCardRecord.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureBeastCardRecord',
);
if (!beastCardRecordClass) fail('HomeFeatureBeastCardRecord class not found');
const beastCardRecordFields = beastCardRecordClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (beastCardRecordFields.length > 0) {
    fail(
        'HomeFeatureBeastCardRecord must keep state in Base/Adventure initializers; '
        + `found ${beastCardRecordFields.length} field declaration(s)`,
    );
}

const beastCardShell = parseSource('HomeFeatureBeastCardShell.ts');
const beastCardShellClass = beastCardShell.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureBeastCardShell',
);
if (!beastCardShellClass) fail('HomeFeatureBeastCardShell class not found');
const beastCardShellFields = beastCardShellClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (beastCardShellFields.length > 0) {
    fail(
        'HomeFeatureBeastCardShell must keep state in Base/Adventure initializers; '
        + `found ${beastCardShellFields.length} field declaration(s)`,
    );
}

const beastStrengthenPage = parseSource('HomeFeatureBeastStrengthenPage.ts');
const beastStrengthenPageClass = beastStrengthenPage.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureBeastStrengthenPage',
);
if (!beastStrengthenPageClass) fail('HomeFeatureBeastStrengthenPage class not found');
const beastStrengthenPageFields = beastStrengthenPageClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (beastStrengthenPageFields.length > 0) {
    fail(
        'HomeFeatureBeastStrengthenPage must keep state in Base/Adventure initializers; '
        + `found ${beastStrengthenPageFields.length} field declaration(s)`,
    );
}

const beastStrengthenInteraction = parseSource('HomeFeatureBeastStrengthenInteraction.ts');
const beastStrengthenInteractionClass = beastStrengthenInteraction.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureBeastStrengthenInteraction',
);
if (!beastStrengthenInteractionClass) fail('HomeFeatureBeastStrengthenInteraction class not found');
const beastStrengthenInteractionFields = beastStrengthenInteractionClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (beastStrengthenInteractionFields.length > 0) {
    fail(
        'HomeFeatureBeastStrengthenInteraction must keep state in Base/Adventure initializers; '
        + `found ${beastStrengthenInteractionFields.length} field declaration(s)`,
    );
}

const battleEntry = parseSource('HomeFeatureBattleEntry.ts');
const battleEntryClass = battleEntry.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureBattleEntry',
);
if (!battleEntryClass) fail('HomeFeatureBattleEntry class not found');
const battleEntryFields = battleEntryClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (battleEntryFields.length > 0) {
    fail(
        'HomeFeatureBattleEntry must keep state in HomeViewBase; '
        + `found ${battleEntryFields.length} field declaration(s)`,
    );
}

const battleUpgrade = parseSource('HomeFeatureBattleUpgrade.ts');
const battleUpgradeClass = battleUpgrade.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureBattleUpgrade',
);
if (!battleUpgradeClass) fail('HomeFeatureBattleUpgrade class not found');
const battleUpgradeFields = battleUpgradeClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (battleUpgradeFields.length > 0) {
    fail(
        'HomeFeatureBattleUpgrade must keep state in HomeViewBase; '
        + `found ${battleUpgradeFields.length} field declaration(s)`,
    );
}

const battleChallenge = parseSource('HomeFeatureBattleChallenge.ts');
const battleChallengeClass = battleChallenge.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureBattleChallenge',
);
if (!battleChallengeClass) fail('HomeFeatureBattleChallenge class not found');
const battleChallengeFields = battleChallengeClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (battleChallengeFields.length > 0) {
    fail(
        'HomeFeatureBattleChallenge must keep state in Adventure initializer; '
        + `found ${battleChallengeFields.length} field declaration(s)`,
    );
}

const battleCombat = parseSource('HomeFeatureBattleCombat.ts');
const battleCombatClass = battleCombat.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureBattleCombat',
);
if (!battleCombatClass) fail('HomeFeatureBattleCombat class not found');
const battleCombatFields = battleCombatClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (battleCombatFields.length > 0) {
    fail(
        'HomeFeatureBattleCombat must keep state in HomeViewBase; '
        + `found ${battleCombatFields.length} field declaration(s)`,
    );
}

const battleReward = parseSource('HomeFeatureBattleReward.ts');
const battleRewardClass = battleReward.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureBattleReward',
);
if (!battleRewardClass) fail('HomeFeatureBattleReward class not found');
const battleRewardFields = battleRewardClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (battleRewardFields.length > 0) {
    fail(
        'HomeFeatureBattleReward must keep state in Base/Adventure initializers; '
        + `found ${battleRewardFields.length} field declaration(s)`,
    );
}

const battleLifecycle = parseSource('HomeFeatureBattleLifecycle.ts');
const battleLifecycleClass = battleLifecycle.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureBattleLifecycle',
);
if (!battleLifecycleClass) fail('HomeFeatureBattleLifecycle class not found');
const battleLifecycleFields = battleLifecycleClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (battleLifecycleFields.length > 0) {
    fail(
        'HomeFeatureBattleLifecycle must keep state in HomeViewBase; '
        + `found ${battleLifecycleFields.length} field declaration(s)`,
    );
}

const characterCreationUI = parseSource('HomeFeatureCharacterCreationUI.ts');
const characterCreationUIClass = characterCreationUI.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureCharacterCreationUI',
);
if (!characterCreationUIClass) fail('HomeFeatureCharacterCreationUI class not found');
const characterCreationUIFields = characterCreationUIClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (characterCreationUIFields.length > 0) {
    fail(
        'HomeFeatureCharacterCreationUI must keep state in Base/RoleBag initializers; '
        + `found ${characterCreationUIFields.length} field declaration(s)`,
    );
}

const giftShare = parseSource('HomeFeatureGiftShare.ts');
const giftShareClass = giftShare.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureGiftShare',
);
if (!giftShareClass) fail('HomeFeatureGiftShare class not found');
const giftShareFields = giftShareClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (giftShareFields.length > 0) {
    fail(
        'HomeFeatureGiftShare must remain stateless; '
        + `found ${giftShareFields.length} field declaration(s)`,
    );
}

const character = parseSource('HomeFeatureCharacter.ts');
const characterClass = character.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeFeatureCharacter',
);
if (!characterClass) fail('HomeFeatureCharacter class not found');
const characterFields = characterClass.members.filter(
    (member) => ts.isPropertyDeclaration(member),
);
if (characterFields.length > 0) {
    fail(
        'HomeFeatureCharacter must remain stateless; '
        + `found ${characterFields.length} field declaration(s)`,
    );
}

const roleBagFields = roleBagClass.members.filter(
    (member) => ts.isPropertyDeclaration(member)
        && !member.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword),
);
const roleBagArrowStateFields = roleBagFields.filter(
    (field) => field.initializer && ts.isArrowFunction(field.initializer),
);
if (roleBagArrowStateFields.length > 0) {
    fail(
        'HomeViewRoleBag callback state must be prototype methods before composition; '
        + `found ${roleBagArrowStateFields.map((field) => field.name.getText(roleBag.sourceFile)).join(', ')}`,
    );
}

const roleBagInitializer = roleBagClass.members.find(
    (member) => ts.isMethodDeclaration(member)
        && member.name?.getText(roleBag.sourceFile) === 'initializeFeatureState',
);
if (!roleBagInitializer) fail('HomeViewRoleBag.initializeFeatureState not found');

let assignedRoleBagState = [];
function inspectRoleBagInitializer(node) {
    if (ts.isCallExpression(node)
        && node.expression.getText(roleBag.sourceFile) === 'Object.assign'
        && node.arguments.length >= 2
        && ts.isObjectLiteralExpression(node.arguments[1])
    ) {
        assignedRoleBagState = node.arguments[1].properties
            .filter((property) => ts.isPropertyAssignment(property))
            .map((property) => property.name.getText(roleBag.sourceFile));
    }
    ts.forEachChild(node, inspectRoleBagInitializer);
}
inspectRoleBagInitializer(roleBagInitializer);

const declaredRoleBagState = roleBagFields.map(
    (field) => field.name.getText(roleBag.sourceFile),
);
const missingRoleBagState = declaredRoleBagState.filter(
    (fieldName) => !assignedRoleBagState.includes(fieldName),
);
const extraRoleBagState = assignedRoleBagState.filter(
    (fieldName) => !declaredRoleBagState.includes(fieldName),
);
if (missingRoleBagState.length > 0 || extraRoleBagState.length > 0) {
    fail(
        `HomeViewRoleBag state initializer mismatch; missing [${missingRoleBagState.join(', ')}], `
        + `extra [${extraRoleBagState.join(', ')}]`,
    );
}

const adventure = parseSource('HomeViewAdventure.ts');
const adventureClass = adventure.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeViewAdventure',
);
if (!adventureClass) fail('HomeViewAdventure class not found');

const adventureFields = adventureClass.members.filter(
    (member) => ts.isPropertyDeclaration(member)
        && !member.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword),
);
const arrowStateFields = adventureFields.filter(
    (field) => field.initializer && ts.isArrowFunction(field.initializer),
);
if (arrowStateFields.length > 0) {
    fail(
        'HomeViewAdventure callback state must be prototype methods before composition; '
        + `found ${arrowStateFields.map((field) => field.name.getText(adventure.sourceFile)).join(', ')}`,
    );
}

const adventureInitializer = adventureClass.members.find(
    (member) => ts.isMethodDeclaration(member)
        && member.name?.getText(adventure.sourceFile) === 'initializeFeatureState',
);
if (!adventureInitializer) fail('HomeViewAdventure.initializeFeatureState not found');

let assignedAdventureState = [];
function inspectAdventureInitializer(node) {
    if (ts.isCallExpression(node)
        && node.expression.getText(adventure.sourceFile) === 'Object.assign'
        && node.arguments.length >= 2
        && ts.isObjectLiteralExpression(node.arguments[1])
    ) {
        assignedAdventureState = node.arguments[1].properties
            .filter((property) => ts.isPropertyAssignment(property))
            .map((property) => property.name.getText(adventure.sourceFile));
    }
    ts.forEachChild(node, inspectAdventureInitializer);
}
inspectAdventureInitializer(adventureInitializer);

const declaredAdventureState = adventureFields.map(
    (field) => field.name.getText(adventure.sourceFile),
);
const missingAdventureState = declaredAdventureState.filter(
    (fieldName) => !assignedAdventureState.includes(fieldName),
);
const extraAdventureState = assignedAdventureState.filter(
    (fieldName) => !declaredAdventureState.includes(fieldName),
);
if (missingAdventureState.length > 0 || extraAdventureState.length > 0) {
    fail(
        `HomeViewAdventure state initializer mismatch; missing [${missingAdventureState.join(', ')}], `
        + `extra [${extraAdventureState.join(', ')}]`,
    );
}

const base = parseSource('HomeViewBase.ts');
const baseClass = base.sourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement)
        && statement.name?.text === 'HomeViewBase',
);
if (!baseClass) fail('HomeViewBase class not found');

function concretePrototypeMethods(classNode, sourceFile) {
    return classNode.members
        .filter((member) => ts.isMethodDeclaration(member))
        .filter((method) => !method.modifiers?.some(
            (modifier) => modifier.kind === ts.SyntaxKind.AbstractKeyword
                || modifier.kind === ts.SyntaxKind.StaticKeyword,
        ))
        .map((method) => method.name.getText(sourceFile));
}

function assertExactOverrides(label, actual, expected) {
    const actualSorted = [...actual].sort();
    const expectedSorted = [...expected].sort();
    if (JSON.stringify(actualSorted) !== JSON.stringify(expectedSorted)) {
        fail(
            `${label} override set changed; expected [${expectedSorted.join(', ')}], `
            + `got [${actualSorted.join(', ')}]`,
        );
    }
}

const baseMethods = new Set(concretePrototypeMethods(baseClass, base.sourceFile));
const roleBagMethods = concretePrototypeMethods(roleBagClass, roleBag.sourceFile);
const roleBagOverrides = roleBagMethods.filter((methodName) => baseMethods.has(methodName));
assertExactOverrides('HomeViewRoleBag', roleBagOverrides, []);

const duelRecordMethods = concretePrototypeMethods(
    duelRecordClass,
    duelRecord.sourceFile,
);
assertExactOverrides(
    'HomeFeatureDuelRecord methods',
    duelRecordMethods,
    [
        'ensureDuelJianghuRecordPage',
        'setupDuelJianghuRecordScrollView',
        'ensureDuelJianghuRecordSectionTitle',
        'ensureDuelJianghuRecordStatsPanel',
        'ensureDuelJianghuRecordRecentPanel',
        'ensureDuelJianghuRecordSummaryPanel',
        'ensureDuelJianghuRecordPersonalRows',
        'ensureDuelJianghuRecordValueCell',
        'ensureDuelJianghuRecordPersonalRow',
        'ensureDuelJianghuRecordStatDetailPanel',
        'refreshDuelJianghuRecordPage',
        'refreshDuelJianghuRecordStatsPanel',
        'refreshDuelJianghuRecordRecentPanel',
        'refreshDuelJianghuRecordSummaryPanel',
        'refreshDuelJianghuRecordPersonalRows',
        'refreshDuelJianghuRecordStatDetailRows',
        'setDuelJianghuRecordValueCell',
        'showDuelJianghuRecordStatDetail',
        'closeDuelJianghuRecordStatDetail',
        'getDuelJianghuRecordStats',
        'getDuelJianghuRecordKillHistory',
        'getDuelJianghuPersonalRecords',
    ],
);
const duelRecordOverrides = duelRecordMethods.filter(
    (methodName) => baseMethods.has(methodName) || roleBagMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureDuelRecord overrides', duelRecordOverrides, []);

const duelRankMethods = concretePrototypeMethods(
    duelRankClass,
    duelRank.sourceFile,
);
assertExactOverrides(
    'HomeFeatureDuelRank methods',
    duelRankMethods,
    [
        'ensureDuelJianghuRankPage',
        'ensureDuelJianghuRankTab',
        'ensureDuelJianghuRankTopCard',
        'ensureDuelJianghuRankRow',
        'ensureDuelJianghuRankAvatar',
        'switchDuelJianghuRankMetric',
        'switchDuelJianghuRankPeriod',
        'refreshDuelJianghuRankPage',
        'refreshDuelJianghuRankScrollableRows',
        'refreshDuelJianghuRankTabs',
        'refreshDuelJianghuRankTopCard',
        'refreshDuelJianghuRankRow',
        'getDuelJianghuRankMetricText',
        'getDuelJianghuRankValue',
        'getDuelJianghuRankEntries',
        'getDuelJianghuSelfRankEntry',
    ],
);
const duelRankOverrides = duelRankMethods.filter(
    (methodName) => baseMethods.has(methodName)
        || roleBagMethods.includes(methodName)
        || duelRecordMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureDuelRank overrides', duelRankOverrides, []);

const duelInvestMethods = concretePrototypeMethods(
    duelInvestClass,
    duelInvest.sourceFile,
);
assertExactOverrides(
    'HomeFeatureDuelInvest methods',
    duelInvestMethods,
    [
        'buildDuelJianghuInvestControls',
        'setupDuelJianghuInvestEditBox',
        'getNormalizedJianghuInvestAmount',
        'startDuelJianghuInvestRound',
        'isDuelJianghuInvestSwitchLocked',
    ],
);
const duelInvestOverrides = duelInvestMethods.filter(
    (methodName) => baseMethods.has(methodName)
        || roleBagMethods.includes(methodName)
        || duelRecordMethods.includes(methodName)
        || duelRankMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureDuelInvest overrides', duelInvestOverrides, []);

const duelRoundClockMethods = concretePrototypeMethods(
    duelRoundClockClass,
    duelRoundClock.sourceFile,
);
assertExactOverrides(
    'HomeFeatureDuelRoundClock methods',
    duelRoundClockMethods,
    [
        'duelJianghuCountdownTick',
        'startDuelJianghuCountdown',
        'tickDuelJianghuCountdown',
        'updateDuelJianghuCountdownLabel',
        'getActiveDuelJianghuPage',
        'stopDuelJianghuGameplay',
        'closeDuelJianghuResultPopup',
    ],
);
const duelRoundClockOverrides = duelRoundClockMethods.filter(
    (methodName) => baseMethods.has(methodName)
        || roleBagMethods.includes(methodName)
        || duelRecordMethods.includes(methodName)
        || duelRankMethods.includes(methodName)
        || duelInvestMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureDuelRoundClock overrides', duelRoundClockOverrides, []);

const duelRoundResolutionMethods = concretePrototypeMethods(
    duelRoundResolutionClass,
    duelRoundResolution.sourceFile,
);
assertExactOverrides(
    'HomeFeatureDuelRoundResolution methods',
    duelRoundResolutionMethods,
    [
        'resolveDuelJianghuRound',
        'playDuelJianghuPreviewRound',
        'createDuelJianghuRoundPlan',
        'pickDuelJianghuRooms',
        'getDuelJianghuKilledRoomIds',
        'getDuelJianghuRoomById',
        'showDuelJianghuResultPopup',
        'formatDuelJianghuYuanbaoAmount',
    ],
);
const duelRoundResolutionOverrides = duelRoundResolutionMethods.filter(
    (methodName) => baseMethods.has(methodName)
        || roleBagMethods.includes(methodName)
        || duelRecordMethods.includes(methodName)
        || duelRankMethods.includes(methodName)
        || duelInvestMethods.includes(methodName)
        || duelRoundClockMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureDuelRoundResolution overrides', duelRoundResolutionOverrides, []);

const duelActorRuntimeMethods = concretePrototypeMethods(
    duelActorRuntimeClass,
    duelActorRuntime.sourceFile,
);
assertExactOverrides(
    'HomeFeatureDuelActorRuntime methods',
    duelActorRuntimeMethods,
    [
        'ensureDuelJianghuNpcCrowd',
        'ensureDuelJianghuLobbyPlayer',
        'playDuelJianghuKillerSequence',
        'playDuelJianghuKillerAttack',
        'moveDuelJianghuCommonActorsOut',
        'refreshDuelJianghuActorToLobby',
        'prepareDuelJianghuRoomActorsForRound',
        'createDuelJianghuActor',
        'attachDuelJianghuPlayerArrow',
        'loadDuelJianghuSkeletonData',
        'getDuelJianghuActorScale',
        'playDuelJianghuActorAnimation',
        'playDuelJianghuSkeletonAnimation',
        'playDuelJianghuKillerAttackAnimation',
        'prepareDuelJianghuSkeletonSkin',
        'moveDuelJianghuActorAlongRoute',
        'moveDuelJianghuActorIntoRoom',
        'moveDuelJianghuActorOutToLobby',
        'faceDuelJianghuActorTo',
        'getDuelJianghuActorLayer',
        'getDuelJianghuPointPosition',
        'getDuelJianghuEntryRoute',
        'getDuelJianghuKillerRoute',
        'getDuelJianghuRouteToDoor',
        'getDuelJianghuExitRoute',
        'createDuelJianghuCorridorRoute',
        'createDuelJianghuRouteToDoor',
        'getDuelJianghuRouteStartPoint',
        'getDuelJianghuRouteTurnPoint',
        'getDuelJianghuRoutePointsForRoom',
        'getDuelJianghuRouteDoorPosition',
        'compactDuelJianghuRoute',
        'getDuelJianghuConfrontPositions',
        'getDuelJianghuRoomGridPoint',
        'getDuelJianghuLobbyPoint',
        'getDuelJianghuPlayerStartPoint',
        'getDuelJianghuLobbyArea',
        'getDuelJianghuRoomRandomPoint',
        'getDuelJianghuRoomArea',
        'getDuelJianghuNodePositionInPage',
        'getDuelJianghuNodeScaleToPage',
        'removeDuelJianghuActors',
        'stopDuelJianghuActorTweens',
        'waitDuelJianghuSeconds',
    ],
);
const duelActorRuntimeOverrides = duelActorRuntimeMethods.filter(
    (methodName) => baseMethods.has(methodName)
        || roleBagMethods.includes(methodName)
        || duelRecordMethods.includes(methodName)
        || duelRankMethods.includes(methodName)
        || duelInvestMethods.includes(methodName)
        || duelRoundClockMethods.includes(methodName)
        || duelRoundResolutionMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureDuelActorRuntime overrides', duelActorRuntimeOverrides, []);

const duelSceneUIMethods = concretePrototypeMethods(
    duelSceneUIClass,
    duelSceneUI.sourceFile,
);
assertExactOverrides(
    'HomeFeatureDuelSceneUI methods',
    duelSceneUIMethods,
    [
        'buildDuelJianghuTopInfo',
        'getJianghuYuanbaoAmountText',
        'buildDuelJianghuRoomLabels',
        'refreshDuelJianghuRoomHighlights',
        'buildDuelJianghuSideButtons',
        'openDuelJianghuReservedPage',
        'ensureDuelJianghuReservedPage',
        'closeDuelJianghuReservedPages',
        'closeActiveDuelJianghuReservedPage',
        'buildDuelJianghuRuntimeLayers',
        'ensureDuelJianghuResultPopup',
        'getOrCreateDuelRoomLabel',
        'resetDuelGameplayTagScales',
    ],
);
const duelSceneUIOverrides = duelSceneUIMethods.filter(
    (methodName) => baseMethods.has(methodName)
        || roleBagMethods.includes(methodName)
        || duelRecordMethods.includes(methodName)
        || duelRankMethods.includes(methodName)
        || duelInvestMethods.includes(methodName)
        || duelRoundClockMethods.includes(methodName)
        || duelRoundResolutionMethods.includes(methodName)
        || duelActorRuntimeMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureDuelSceneUI overrides', duelSceneUIOverrides, []);

const duelLobbyMethods = concretePrototypeMethods(
    duelLobbyClass,
    duelLobby.sourceFile,
);
assertExactOverrides(
    'HomeFeatureDuelLobby methods',
    duelLobbyMethods,
    [
        'bindDuelPage',
        'switchDuelTab',
        'refreshDuelLandingPage',
        'handleDuelBack',
        'handleDuelGameplayClicked',
        'onDuelLuanshiZhengxiongClicked',
        'onDuelGuxuTanbaoClicked',
        'onDuelJianghuTaoshaClicked',
        'onDuelTaxianChumoClicked',
        'openDuelJianghuTaoshaPage',
    ],
);
const duelLobbyOverrides = duelLobbyMethods.filter(
    (methodName) => baseMethods.has(methodName)
        || roleBagMethods.includes(methodName)
        || duelRecordMethods.includes(methodName)
        || duelRankMethods.includes(methodName)
        || duelInvestMethods.includes(methodName)
        || duelRoundClockMethods.includes(methodName)
        || duelRoundResolutionMethods.includes(methodName)
        || duelActorRuntimeMethods.includes(methodName)
        || duelSceneUIMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureDuelLobby overrides', duelLobbyOverrides, []);

const showcaseMethods = concretePrototypeMethods(
    showcaseClass,
    showcase.sourceFile,
);
assertExactOverrides(
    'HomeFeatureShowcase methods',
    showcaseMethods,
    [
        'bindShowcasePage',
        'buildShowcaseDashboard',
        'createShowcasePanel',
        'createShowcaseLabel',
        'createShowcaseTrendChart',
        'createShowcaseLineSegment',
        'switchShowcaseTab',
    ],
);
const showcaseOverrides = showcaseMethods.filter(
    (methodName) => baseMethods.has(methodName)
        || roleBagMethods.includes(methodName)
        || duelRecordMethods.includes(methodName)
        || duelRankMethods.includes(methodName)
        || duelInvestMethods.includes(methodName)
        || duelRoundClockMethods.includes(methodName)
        || duelRoundResolutionMethods.includes(methodName)
        || duelActorRuntimeMethods.includes(methodName)
        || duelSceneUIMethods.includes(methodName)
        || duelLobbyMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureShowcase overrides', showcaseOverrides, []);

const itemDetailMethods = concretePrototypeMethods(
    itemDetailClass,
    itemDetail.sourceFile,
);
assertExactOverrides(
    'HomeFeatureItemDetail methods',
    itemDetailMethods,
    [
        'getItemDetailAttrFramePath',
        'openItemDetailPopup',
        'prepareDefaultItemDetailPopup',
        'openBagIllustrationItemDetailPopup',
        'hideDefaultItemDetailFields',
        'layoutBagIllustrationDetailPopup',
        'getOrCreatePopupSkinnedNode',
        'getOrCreatePopupLabel',
        'getBagIllustrationUsage',
        'getBagIllustrationObtainSource',
        'openCommerceItemDetail',
        'layoutMarketCommerceItemDetailPopup',
    ],
);
const itemDetailOverrides = itemDetailMethods.filter(
    (methodName) => baseMethods.has(methodName)
        || roleBagMethods.includes(methodName)
        || duelRecordMethods.includes(methodName)
        || duelRankMethods.includes(methodName)
        || duelInvestMethods.includes(methodName)
        || duelRoundClockMethods.includes(methodName)
        || duelRoundResolutionMethods.includes(methodName)
        || duelActorRuntimeMethods.includes(methodName)
        || duelSceneUIMethods.includes(methodName)
        || duelLobbyMethods.includes(methodName)
        || showcaseMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureItemDetail overrides', itemDetailOverrides, []);

const commerceConfirmMethods = concretePrototypeMethods(
    commerceConfirmClass,
    commerceConfirm.sourceFile,
);
assertExactOverrides(
    'HomeFeatureCommerceConfirm methods',
    commerceConfirmMethods,
    [
        'getOrCreateConfirmChild',
        'getOrCreateConfirmSkin',
        'getOrCreateConfirmSkinKeepingEditorLayout',
        'getOrCreateConfirmLabel',
        'getOrCreateConfirmRichText',
        'escapeRichText',
        'formatPlainConfirmRichText',
        'formatCommercePrice',
        'formatCommerceQuantityConfirmMessage',
        'formatCommerceQuantityConfirmRichMessage',
        'layoutCommerceQuantityConfirmPopup',
        'hideCommerceConfirmMessageBg',
        'openCommerceQuantityConfirm',
    ],
);
const commerceConfirmOverrides = commerceConfirmMethods.filter(
    (methodName) => baseMethods.has(methodName)
        || roleBagMethods.includes(methodName)
        || duelRecordMethods.includes(methodName)
        || duelRankMethods.includes(methodName)
        || duelInvestMethods.includes(methodName)
        || duelRoundClockMethods.includes(methodName)
        || duelRoundResolutionMethods.includes(methodName)
        || duelActorRuntimeMethods.includes(methodName)
        || duelSceneUIMethods.includes(methodName)
        || duelLobbyMethods.includes(methodName)
        || showcaseMethods.includes(methodName)
        || itemDetailMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureCommerceConfirm overrides', commerceConfirmOverrides, []);

const bagMethods = concretePrototypeMethods(
    bagClass,
    bag.sourceFile,
);
assertExactOverrides(
    'HomeFeatureBag methods',
    bagMethods,
    [
        'openBagPanel',
        'closeBagPanel',
        'buildBagPanel',
        'createBagMaterialBoard',
        'ensureBagModeFrames',
        'removeBagModeFrame',
        'getOrCreateBagModeRoot',
        'getOrCreateBagModeSkin',
        'layoutBagDecomposeMode',
        'createBagDecomposeActionButtons',
        'refreshBagDecomposeSlots',
        'renderBagDecomposeSlot',
        'getBagDecomposeItems',
        'selectBagDecomposeItem',
        'getBagDecomposeResult',
        'getBagEquipmentStatType',
        'isBeastVeinEquipment',
        'getBagEquipmentSlotId',
        'openBagDecomposeConfirm',
        'confirmBagDecompose',
        'layoutBagSynthMode',
        'raiseActiveBagModeFrame',
        'openBagIllustrationPanel',
        'closeBagIllustrationPanel',
        'buildBagIllustrationPanel',
        'createBagCatalogView',
        'createBagCategoryTabs',
        'switchBagCatalogCategory',
        'refreshBagCategoryTabs',
        'refreshBagCatalogGrid',
        'sortBagCatalogItems',
        'getBagEquipmentSortOrder',
        'getBagItemFrameLevel',
        'getBagItemIconIndex',
        'getBagItemIdIndex',
        'getBagGridLayout',
        'createBagGridItem',
        'bindGridItemTap',
        'bindBagGridScroll',
        'createBagBottomTabs',
        'createBagBottomButton',
        'switchBagPage',
        'refreshBagBottomTabState',
    ],
);
const bagOverrides = bagMethods.filter(
    (methodName) => baseMethods.has(methodName)
        || roleBagMethods.includes(methodName)
        || duelRecordMethods.includes(methodName)
        || duelRankMethods.includes(methodName)
        || duelInvestMethods.includes(methodName)
        || duelRoundClockMethods.includes(methodName)
        || duelRoundResolutionMethods.includes(methodName)
        || duelActorRuntimeMethods.includes(methodName)
        || duelSceneUIMethods.includes(methodName)
        || duelLobbyMethods.includes(methodName)
        || showcaseMethods.includes(methodName)
        || itemDetailMethods.includes(methodName)
        || commerceConfirmMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureBag overrides', bagOverrides, []);

const roleEquipmentMethods = concretePrototypeMethods(
    roleEquipmentClass,
    roleEquipment.sourceFile,
);
assertExactOverrides(
    'HomeFeatureRoleEquipment methods',
    roleEquipmentMethods,
    [
        'buildRolePagePanel',
        'getOrCreateRolePageNode',
        'getOrCreateRolePageSkinnedNode',
        'getOrCreateRolePageLabel',
        'getRoleEquipmentSlotConfigs',
        'getRoleEquipmentIconIndexByTier',
        'getCatalogDisplayName',
        'createRolePageSideFrame',
        'applyRoleEquipSelectedFrameSkin',
        'getRoleEquipmentBaseItems',
        'getRoleEquipmentCandidates',
        'getCurrentRoleEquipment',
        'getEquipmentBaseTier',
        'getEquipmentLevel',
        'getEquipmentLevelBySlot',
        'getRoleEquipmentStatRule',
        'getEquipmentLevelRow',
        'getEquipmentStatValueForLevel',
        'getEquipmentStatValue',
        'getCurrentEquipmentStatValue',
        'getEquipmentAttrLines',
        'getRoleStrengthenCost',
        'getOrCreateRoleEquipChild',
        'getOrCreateRoleEquipSkin',
        'getOrCreateRoleEquipLabel',
        'drawRoleEquipDim',
        'ensureRoleEquipDetailPopup',
        'ensureRoleEquipReplacePopup',
        'fadeRoleEquipPopup',
        'openRoleEquipmentDetail',
        'openRoleEquipmentConfirm',
        'layoutRoleEquipDetailPopup',
        'transitionRoleEquipDetailToReplace',
        'openRoleEquipmentReplacePopup',
        'layoutRoleEquipReplacePopup',
        'createRoleEquipReplaceCell',
        'confirmRoleEquipmentReplacement',
        'syncRoleEquipmentSlot',
        'closeRoleEquipDetailPopup',
        'closeRoleEquipReplacePopup',
        'createRolePageBottomTabs',
        'createRolePageBottomButton',
    ],
);
const roleEquipmentOverrides = roleEquipmentMethods.filter(
    (methodName) => baseMethods.has(methodName)
        || roleBagMethods.includes(methodName)
        || duelRecordMethods.includes(methodName)
        || duelRankMethods.includes(methodName)
        || duelInvestMethods.includes(methodName)
        || duelRoundClockMethods.includes(methodName)
        || duelRoundResolutionMethods.includes(methodName)
        || duelActorRuntimeMethods.includes(methodName)
        || duelSceneUIMethods.includes(methodName)
        || duelLobbyMethods.includes(methodName)
        || showcaseMethods.includes(methodName)
        || itemDetailMethods.includes(methodName)
        || commerceConfirmMethods.includes(methodName)
        || bagMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureRoleEquipment overrides', roleEquipmentOverrides, []);

const roleProgressionMethods = concretePrototypeMethods(
    roleProgressionClass,
    roleProgression.sourceFile,
);
assertExactOverrides(
    'HomeFeatureRoleProgression methods',
    roleProgressionMethods,
    [
        'getRoleCurrentLevel',
        'getRoleLevelExpConfig',
        'getRoleNextLevel',
        'getRoleNextLevelNeedExp',
        'getRoleExpProgressRatio',
        'getRoleLevelAttrs',
        'addRoleAttrs',
        'getRoleEquipmentAttrs',
        'getRoleTotalAttrs',
        'getRolePowerFromAttrs',
        'getRoleTotalPower',
        'getRoleSnapshot',
        'getRoleInventoryCount',
        'setRoleInventoryCount',
        'addRoleInventory',
        'consumeRoleInventory',
        'getRoleSeededBagItems',
        'getBagItemCount',
        'refreshRoleInventoryViews',
        'getRoleBreakthroughConfig',
        'getRoleUpcomingBreakthroughLevel',
        'getRolePendingBreakthroughLevel',
        'isRoleBreakthroughPending',
        'getRoleBreakthroughMaterialConfig',
        'getRoleBreakthroughDisplayCosts',
        'getRoleBreakthroughCosts',
        'getRoleBreakthroughMissingText',
        'findRoleBreakthroughBlockWithExp',
        'canConsumeRoleBreakthrough',
        'consumeRoleBreakthrough',
    ],
);
const roleProgressionOverrides = roleProgressionMethods.filter(
    (methodName) => baseMethods.has(methodName)
        || roleBagMethods.includes(methodName)
        || duelRecordMethods.includes(methodName)
        || duelRankMethods.includes(methodName)
        || duelInvestMethods.includes(methodName)
        || duelRoundClockMethods.includes(methodName)
        || duelRoundResolutionMethods.includes(methodName)
        || duelActorRuntimeMethods.includes(methodName)
        || duelSceneUIMethods.includes(methodName)
        || duelLobbyMethods.includes(methodName)
        || showcaseMethods.includes(methodName)
        || itemDetailMethods.includes(methodName)
        || commerceConfirmMethods.includes(methodName)
        || bagMethods.includes(methodName)
        || roleEquipmentMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureRoleProgression overrides', roleProgressionOverrides, []);

const roleAdvanceMethods = concretePrototypeMethods(
    roleAdvanceClass,
    roleAdvance.sourceFile,
);
assertExactOverrides(
    'HomeFeatureRoleAdvance methods',
    roleAdvanceMethods,
    [
        'buildRoleAdvancePage',
        'createRoleAdvanceAttrLine',
        'createRoleAdvanceExpBar',
        'refreshRoleAdvanceBreakthroughCosts',
        'createRoleAdvanceExpOrb',
        'createRoleAdvanceBreakthroughOrbs',
        'refreshRoleAdvanceMaterialSlots',
        'applyRoleAdvanceExpFillSkin',
        'handleRoleBreakthroughClick',
        'handleRoleAdvanceExpOrbClick',
        'playRoleAdvanceExpEffect',
        'setRoleAdvanceExpFillRatio',
        'syncRoleAdvanceExpBarLayerOrder',
        'clampRoleAdvanceExpRatio',
        'refreshRoleAdvancePage',
        'setRoleAdvanceAttrValue',
        'setRolePageLabelText',
    ],
);
const roleAdvanceOverrides = roleAdvanceMethods.filter(
    (methodName) => baseMethods.has(methodName)
        || roleBagMethods.includes(methodName)
        || duelRecordMethods.includes(methodName)
        || duelRankMethods.includes(methodName)
        || duelInvestMethods.includes(methodName)
        || duelRoundClockMethods.includes(methodName)
        || duelRoundResolutionMethods.includes(methodName)
        || duelActorRuntimeMethods.includes(methodName)
        || duelSceneUIMethods.includes(methodName)
        || duelLobbyMethods.includes(methodName)
        || showcaseMethods.includes(methodName)
        || itemDetailMethods.includes(methodName)
        || commerceConfirmMethods.includes(methodName)
        || bagMethods.includes(methodName)
        || roleEquipmentMethods.includes(methodName)
        || roleProgressionMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureRoleAdvance overrides', roleAdvanceOverrides, []);

const roleStrengthenMethods = concretePrototypeMethods(
    roleStrengthenClass,
    roleStrengthen.sourceFile,
);
assertExactOverrides(
    'HomeFeatureRoleStrengthen methods',
    roleStrengthenMethods,
    [
        'buildRoleStrengthenPage',
        'createRoleStrengthenMaterial',
        'updateRoleStrengthenStatus',
        'getRoleStrengthenMaterialConfig',
        'refreshRoleStrengthenMaterials',
        'handleRoleStrengthenClick',
        'ensureRoleProgressSuccessPopup',
        'openRoleProgressSuccessPopup',
        'layoutRoleProgressSuccessPopup',
        'layoutRoleSuccessPowerDelta',
        'getRoleSuccessPowerDigitWidth',
        'createRoleSuccessStatRow',
        'playRoleProgressSuccessAnimation',
        'startRoleProgressSuccessLoop',
        'closeRoleProgressSuccessPopup',
        'resetRoleStrengthenSelection',
        'selectRoleStrengthenEquipment',
        'updateRoleStrengthenSelectionHighlight',
    ],
);
const roleStrengthenOverrides = roleStrengthenMethods.filter(
    (methodName) => baseMethods.has(methodName)
        || roleBagMethods.includes(methodName)
        || duelRecordMethods.includes(methodName)
        || duelRankMethods.includes(methodName)
        || duelInvestMethods.includes(methodName)
        || duelRoundClockMethods.includes(methodName)
        || duelRoundResolutionMethods.includes(methodName)
        || duelActorRuntimeMethods.includes(methodName)
        || duelSceneUIMethods.includes(methodName)
        || duelLobbyMethods.includes(methodName)
        || showcaseMethods.includes(methodName)
        || itemDetailMethods.includes(methodName)
        || commerceConfirmMethods.includes(methodName)
        || bagMethods.includes(methodName)
        || roleEquipmentMethods.includes(methodName)
        || roleProgressionMethods.includes(methodName)
        || roleAdvanceMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureRoleStrengthen overrides', roleStrengthenOverrides, []);

const characterCreationUIMethods = concretePrototypeMethods(
    characterCreationUIClass,
    characterCreationUI.sourceFile,
);
assertExactOverrides(
    'HomeFeatureCharacterCreationUI methods',
    characterCreationUIMethods,
    [
        'buildCharacterPanel',
        'getOrCreateEditorNode',
        'getOrCreateEditorSkinnedNode',
        'getOrCreateEditorLabel',
        'ensureCharacterSelectCardLayoutNodes',
        'createCharacterSelectCard',
        'getCharacterSelectCardSkin',
        'getCharacterSelectCardLayout',
        'getEditorCharacterSelectCardLayout',
        'getDefaultCharacterSelectCardLayout',
        'refreshCharacterSelectCards',
        'loadCharacterSelectRoleSkeleton',
        'refreshCharacterSelectRoleVisibility',
        'setupHiddenNameEditBox',
        'createHiddenEditBoxLabel',
        'refreshCharacterNameDisplay',
        'showCharacterNameCursor',
        'hideCharacterNameCursor',
        'updateCharacterNameCursorPosition',
        'blinkCharacterNameCursor',
        'hideNativeNameCaret',
        'loadCharacterSelectBackground',
    ],
);
const characterCreationUIOverrides = characterCreationUIMethods.filter(
    (methodName) => baseMethods.has(methodName)
        || roleBagMethods.includes(methodName)
        || duelRecordMethods.includes(methodName)
        || duelRankMethods.includes(methodName)
        || duelInvestMethods.includes(methodName)
        || duelRoundClockMethods.includes(methodName)
        || duelRoundResolutionMethods.includes(methodName)
        || duelActorRuntimeMethods.includes(methodName)
        || duelSceneUIMethods.includes(methodName)
        || duelLobbyMethods.includes(methodName)
        || showcaseMethods.includes(methodName)
        || itemDetailMethods.includes(methodName)
        || commerceConfirmMethods.includes(methodName)
        || bagMethods.includes(methodName)
        || roleEquipmentMethods.includes(methodName)
        || roleProgressionMethods.includes(methodName)
        || roleAdvanceMethods.includes(methodName)
        || roleStrengthenMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureCharacterCreationUI overrides', characterCreationUIOverrides, []);

const characterMethods = concretePrototypeMethods(
    characterClass,
    character.sourceFile,
);
assertExactOverrides(
    'HomeFeatureCharacter methods',
    characterMethods,
    [
        'openRoleAttrDetailPanel',
        'closeRoleAttrDetailPanel',
        'buildRoleAttrDetailPanel',
        'refreshRoleAttrDetailPanel',
        'createRoleOption',
        'selectGender',
        'switchGenderByStep',
        'fadeCharacterPreviewAndApply',
        'refreshCharacterGenderLabel',
        'randomizeCharacterName',
        'createRandomRoleName',
        'toggleRoleDropdown',
        'confirmCharacter',
        'syncProfileNameFromPanel',
        'openCharacterPanel',
    ],
);
const characterOverrides = characterMethods.filter(
    (methodName) => baseMethods.has(methodName)
        || roleBagMethods.includes(methodName)
        || duelRecordMethods.includes(methodName)
        || duelRankMethods.includes(methodName)
        || duelInvestMethods.includes(methodName)
        || duelRoundClockMethods.includes(methodName)
        || duelRoundResolutionMethods.includes(methodName)
        || duelActorRuntimeMethods.includes(methodName)
        || duelSceneUIMethods.includes(methodName)
        || duelLobbyMethods.includes(methodName)
        || showcaseMethods.includes(methodName)
        || itemDetailMethods.includes(methodName)
        || commerceConfirmMethods.includes(methodName)
        || bagMethods.includes(methodName)
        || roleEquipmentMethods.includes(methodName)
        || roleProgressionMethods.includes(methodName)
        || roleAdvanceMethods.includes(methodName)
        || roleStrengthenMethods.includes(methodName)
        || characterCreationUIMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureCharacter overrides', characterOverrides, []);

const giftShareMethods = concretePrototypeMethods(
    giftShareClass,
    giftShare.sourceFile,
);
assertExactOverrides(
    'HomeFeatureGiftShare methods',
    giftShareMethods,
    [
        'bindGiftPage',
        'claimGift',
        'claimAllGifts',
        'refreshGiftPage',
        'bindSharePage',
        'handleShareAction',
        'claimShareReward',
        'refreshSharePage',
    ],
);
const giftShareOverrides = giftShareMethods.filter(
    (methodName) => baseMethods.has(methodName)
        || roleBagMethods.includes(methodName)
        || duelRecordMethods.includes(methodName)
        || duelRankMethods.includes(methodName)
        || duelInvestMethods.includes(methodName)
        || duelRoundClockMethods.includes(methodName)
        || duelRoundResolutionMethods.includes(methodName)
        || duelActorRuntimeMethods.includes(methodName)
        || duelSceneUIMethods.includes(methodName)
        || duelLobbyMethods.includes(methodName)
        || showcaseMethods.includes(methodName)
        || itemDetailMethods.includes(methodName)
        || commerceConfirmMethods.includes(methodName)
        || bagMethods.includes(methodName)
        || roleEquipmentMethods.includes(methodName)
        || roleProgressionMethods.includes(methodName)
        || roleAdvanceMethods.includes(methodName)
        || roleStrengthenMethods.includes(methodName)
        || characterCreationUIMethods.includes(methodName)
        || characterMethods.includes(methodName),
);
assertExactOverrides('HomeFeatureGiftShare overrides', giftShareOverrides, []);

const roleBagTargetMethods = new Set([
    ...baseMethods,
    ...roleBagMethods,
    ...duelRecordMethods,
    ...duelRankMethods,
    ...duelInvestMethods,
    ...duelRoundClockMethods,
    ...duelRoundResolutionMethods,
    ...duelActorRuntimeMethods,
    ...duelSceneUIMethods,
    ...duelLobbyMethods,
    ...showcaseMethods,
    ...itemDetailMethods,
    ...commerceConfirmMethods,
    ...bagMethods,
    ...roleEquipmentMethods,
    ...roleProgressionMethods,
    ...roleAdvanceMethods,
    ...roleStrengthenMethods,
    ...characterCreationUIMethods,
    ...characterMethods,
    ...giftShareMethods,
]);
const profileShellMethods = concretePrototypeMethods(
    profileShell.classNode,
    profileShell.sourceFile,
);
assertExactOverrides(
    'HomeFeatureProfileShell methods',
    profileShellMethods,
    [
        'setupAvatarProfileButton',
        'openProfileEntry',
        'openProfilePopup',
        'closeProfilePopup',
        'ensureProfilePopup',
        'bindProfilePopupFromEditor',
        'refreshEditorProfilePopupSkins',
        'buildProfilePopupBoardSkin',
        'buildProfileHeader',
        'ensureProfileAvatarFrameButton',
        'buildProfileActionButtons',
        'refreshProfilePopupLabels',
        'getProfileNicknameText',
        'hideProfileNameBar',
        'applyProfileNicknameLabelStyle',
        'copyProfileUid',
        'openCustomerServiceUrl',
        'applyProfileTextOutline',
        'updateProfileLabels',
        'loadProfile',
        'saveProfile',
    ],
);
const profileShellOverrides = profileShellMethods.filter(
    (methodName) => roleBagTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureProfileShell overrides', profileShellOverrides, []);

const profileShellTargetMethods = new Set([
    ...roleBagTargetMethods,
    ...profileShellMethods,
]);
const profileAvatarFrameMethods = concretePrototypeMethods(
    profileAvatarFrame.classNode,
    profileAvatarFrame.sourceFile,
);
assertExactOverrides(
    'HomeFeatureProfileAvatarFrame methods',
    profileAvatarFrameMethods,
    [
        'openProfileAvatarFramePopup',
        'closeProfileAvatarFramePopup',
        'ensureProfileAvatarFramePopup',
        'bindProfileAvatarFramePopupFromEditor',
        'refreshEditorProfileAvatarFramePopupSkins',
        'setupProfileAvatarFrameScrollView',
        'ensureProfileAvatarFrameCells',
        'createProfileAvatarFrameCells',
        'createProfileAvatarFrameCell',
        'bindProfileAvatarFrameCell',
        'handleProfileAvatarFrameAction',
        'openProfileAvatarFramePurchaseConfirm',
        'refreshProfileAvatarFrameButtons',
        'loadProfileAvatarFrameState',
        'saveProfileAvatarFrameState',
        'applyEquippedProfileAvatarFrameVisual',
        'applyProfileAvatarFramePreviewSkeleton',
        'loadProfileAvatarFrameSkeletonAsset',
        'ensureProfileAvatarFrameSkeletonChild',
        'clearProfileAvatarFrameSkeleton',
        'applyProfileAvatarFrameSkeleton',
    ],
);
const profileAvatarFrameOverrides = profileAvatarFrameMethods.filter(
    (methodName) => profileShellTargetMethods.has(methodName),
);
assertExactOverrides(
    'HomeFeatureProfileAvatarFrame overrides',
    profileAvatarFrameOverrides,
    [],
);

const profileAvatarFrameTargetMethods = new Set([
    ...profileShellTargetMethods,
    ...profileAvatarFrameMethods,
]);
const profileSettingsMethods = concretePrototypeMethods(
    profileSettings.classNode,
    profileSettings.sourceFile,
);
assertExactOverrides(
    'HomeFeatureProfileSettings methods',
    profileSettingsMethods,
    [
        'openProfileSettingsPopup',
        'closeProfileSettingsPopup',
        'ensureProfileSettingsPopup',
        'bindProfileSettingsPopupFromEditor',
        'refreshEditorProfileSettingsPopupSkins',
        'createProfileSettingsSliderRow',
        'createProfileSettingsMuteRow',
        'bindProfileSettingsSlider',
        'setProfileSettingsMusicVolume',
        'setProfileSettingsEffectVolume',
        'setProfileSettingsMuted',
        'refreshProfileSettingsPopup',
        'refreshProfileSettingsSlider',
        'getProfileSettingsSliderRange',
        'getProfileSettingsSliderEditorValue',
        'refreshProfileSettingsToggle',
        'loadProfileAudioSettings',
        'saveProfileAudioSettings',
    ],
);
const profileSettingsOverrides = profileSettingsMethods.filter(
    (methodName) => profileAvatarFrameTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureProfileSettings overrides', profileSettingsOverrides, []);

const profileSettingsTargetMethods = new Set([
    ...profileAvatarFrameTargetMethods,
    ...profileSettingsMethods,
]);
const homeUIRootMethods = concretePrototypeMethods(
    homeUIRoot.classNode,
    homeUIRoot.sourceFile,
);
assertExactOverrides(
    'HomeFeatureHomeUIRoot methods',
    homeUIRootMethods,
    [
        'setupUILayers',
        'refreshRootLayerOrder',
        'refreshBottomEntryChrome',
        'closeBaseBottomEntryPages',
        'closeOtherBottomEntryPages',
        'hideOtherEditorFeaturePages',
        'ensureInputBlocker',
        'shouldAutoBlockInput',
        'stopTouchThrough',
        'hideHomeButtonTextLabels',
        'setupPersistentCurrencyHud',
        'setupSceneCurrencyHud',
        'hideOriginalTopCurrencyHud',
        'refreshPersistentCurrencyHud',
        'requireRootLayer',
        'assertDirectChildOrder',
    ],
);
const homeUIRootOverrides = homeUIRootMethods.filter(
    (methodName) => profileSettingsTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureHomeUIRoot overrides', homeUIRootOverrides, []);

const homeUIRootTargetMethods = new Set([
    ...profileSettingsTargetMethods,
    ...homeUIRootMethods,
]);
const homeSceneShellMethods = concretePrototypeMethods(
    homeSceneShell.classNode,
    homeSceneShell.sourceFile,
);
assertExactOverrides(
    'HomeFeatureHomeSceneShell methods',
    homeSceneShellMethods,
    [
        'setupGameSceneClip',
        'setupMapLayer',
        'setupRoleNode',
        'bindMapTouch',
        'bindEntry',
        'bindScaledClick',
        'playButtonScale',
    ],
);
const homeSceneShellOverrides = homeSceneShellMethods.filter(
    (methodName) => homeUIRootTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureHomeSceneShell overrides', homeSceneShellOverrides, []);

const homeSceneShellTargetMethods = new Set([
    ...homeUIRootTargetMethods,
    ...homeSceneShellMethods,
]);
const assetRuntimeMethods = concretePrototypeMethods(
    assetRuntime.classNode,
    assetRuntime.sourceFile,
);
assertExactOverrides(
    'HomeFeatureAssetRuntime methods',
    assetRuntimeMethods,
    [
        'loadRoleAssets',
        'loadMapBackground',
        'loadSourceMapLayer',
        'applySpriteFrameToNode',
        'createSkinnedNode',
        'applyUiSkin',
        'getNodeRenderSize',
        'applyUiSkinKeepingEditorSize',
        'loadSkeletonData',
        'loadSpriteFrameAsset',
        'loadSkeletonAsset',
        'createSpriteFrame',
        'loadTransitionSkeletonData',
    ],
);
const assetRuntimeOverrides = assetRuntimeMethods.filter(
    (methodName) => homeSceneShellTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureAssetRuntime overrides', assetRuntimeOverrides, []);

const assetRuntimeTargetMethods = new Set([
    ...homeSceneShellTargetMethods,
    ...assetRuntimeMethods,
]);
const roleVisualRuntimeMethods = concretePrototypeMethods(
    roleVisualRuntime.classNode,
    roleVisualRuntime.sourceFile,
);
assertExactOverrides(
    'HomeFeatureRoleVisualRuntime methods',
    roleVisualRuntimeMethods,
    [
        'applyCurrentRole',
        'hasRoleVisual',
        'isUsingRoleSkel',
        'getRoleMapScale',
        'getRolePreviewScale',
        'setSkeletonVisible',
        'applySkeleton',
        'setRoleAnimation',
        'playSkeletonAnimation',
        'prepareSkeletonRenderer',
        'useRealtimeSkeletonMode',
        'applyRoleScale',
    ],
);
const roleVisualRuntimeOverrides = roleVisualRuntimeMethods.filter(
    (methodName) => assetRuntimeTargetMethods.has(methodName),
);
assertExactOverrides(
    'HomeFeatureRoleVisualRuntime overrides',
    roleVisualRuntimeOverrides,
    [],
);

const roleVisualRuntimeTargetMethods = new Set([
    ...assetRuntimeTargetMethods,
    ...roleVisualRuntimeMethods,
]);
const worldMovementMethods = concretePrototypeMethods(
    worldMovement.classNode,
    worldMovement.sourceFile,
);
assertExactOverrides(
    'HomeFeatureWorldMovement methods',
    worldMovementMethods,
    [
        'onMapTouchEnd',
        'moveRoleTo',
        'updateRoleFacing',
        'updateRoleMovement',
        'updateMapFollow',
        'getCenteredRoleBounds',
        'getMapFollowPosition',
        'getMapDisplayMetrics',
        'playPlatformIdle',
    ],
);
const worldMovementOverrides = worldMovementMethods.filter(
    (methodName) => roleVisualRuntimeTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureWorldMovement overrides', worldMovementOverrides, []);

const worldMovementTargetMethods = new Set([
    ...roleVisualRuntimeTargetMethods,
    ...worldMovementMethods,
]);
const toastMethods = concretePrototypeMethods(
    toast.classNode,
    toast.sourceFile,
);
assertExactOverrides(
    'HomeFeatureToast methods',
    toastMethods,
    [
        'showToast',
        'hideToast',
        'setupToastBackground',
        'refreshToastBackground',
        'alignToastLayerOrder',
        'getToastBackgroundWidth',
        'loadToastBackgroundSkin',
    ],
);
const toastOverrides = toastMethods.filter(
    (methodName) => worldMovementTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureToast overrides', toastOverrides, []);

const toastTargetMethods = new Set([
    ...worldMovementTargetMethods,
    ...toastMethods,
]);
const roleDisplayMethods = concretePrototypeMethods(
    roleDisplayClass,
    roleDisplay.sourceFile,
);
assertExactOverrides(
    'HomeFeatureRoleDisplay methods',
    roleDisplayMethods,
    [
        'refreshRolePageRole',
        'refreshRolePagePower',
        'refreshRolePagePowerDigits',
        'getRolePowerDigitWidth',
        'refreshRolePageNameLabel',
        'applyRolePageNameLabelStyle',
        'applyRoleAttrLabelStyle',
        'applyBagLabelStyle',
        'applyBattleEntryTextStyle',
    ],
);
const roleDisplayOverrides = roleDisplayMethods.filter(
    (methodName) => toastTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureRoleDisplay overrides', roleDisplayOverrides, []);

const roleDisplayTargetMethods = new Set([
    ...toastTargetMethods,
    ...roleDisplayMethods,
]);
const transitionLoadingMethods = concretePrototypeMethods(
    transitionLoadingClass,
    transitionLoading.sourceFile,
);
assertExactOverrides(
    'HomeFeatureTransitionLoading methods',
    transitionLoadingMethods,
    [
        'buildTransitionLoadingLayer',
        'withTransitionLoading',
        'setTransitionLoadingVisible',
        'startTransitionDots',
        'stopTransitionDots',
        'wait',
    ],
);
const transitionLoadingOverrides = transitionLoadingMethods.filter(
    (methodName) => roleDisplayTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureTransitionLoading overrides', transitionLoadingOverrides, []);

const transitionLoadingTargetMethods = new Set([
    ...roleDisplayTargetMethods,
    ...transitionLoadingMethods,
]);
const bottomFeatureShellMethods = concretePrototypeMethods(
    bottomFeatureShellClass,
    bottomFeatureShell.sourceFile,
);
assertExactOverrides(
    'HomeFeatureBottomFeatureShell methods',
    bottomFeatureShellMethods,
    [
        'openBottomFeaturePanel',
        'openMagicPanel',
        'openBeastCardPanel',
        'refreshBottomFeatureBackground',
        'closeBottomFeaturePanel',
        'closeOtherBottomEntryPages',
        'closeStandaloneMagicPages',
        'hideBottomFeatureContentRoots',
        'buildBottomFeaturePanel',
        'handleBottomFeatureBackClick',
        'raiseBottomFeatureBackButton',
        'getOrCreateBottomFeatureNode',
        'getOrCreateBottomFeatureSkinnedNode',
        'getOrCreateBottomFeatureLabel',
    ],
);
const bottomFeatureShellOverrides = bottomFeatureShellMethods.filter(
    (methodName) => transitionLoadingTargetMethods.has(methodName),
);
assertExactOverrides(
    'HomeFeatureBottomFeatureShell overrides',
    bottomFeatureShellOverrides,
    ['closeOtherBottomEntryPages'],
);

const bottomFeatureShellTargetMethods = new Set([
    ...transitionLoadingTargetMethods,
    ...bottomFeatureShellMethods,
]);
const magicSceneMethods = concretePrototypeMethods(
    magicSceneClass,
    magicScene.sourceFile,
);
assertExactOverrides(
    'HomeFeatureMagicScene methods',
    magicSceneMethods,
    [
        'ensureMagicScenePanel',
        'ensureMagicSceneCloudAnimation',
        'setupMagicSceneInput',
        'onMagicSceneTouchStart',
        'onMagicSceneTouchMove',
        'onMagicSceneTouchEnd',
        'bindMagicSceneEntry',
        'snapMagicSceneToNearestEntry',
        'selectMagicScene',
        'playMagicSceneEntryTapFeedback',
        'getNearestMagicSceneEntryIndex',
        'getMagicSceneEntryPosition',
        'setMagicSceneWorldX',
        'focusMagicSceneEntry',
        'loadMagicSceneEntrySkeletons',
        'refreshMagicSceneEntrySelection',
        'getVerticalMagicSceneTitle',
        'openMagicFloorPanel',
        'ensureMagicFloorPanel',
        'ensureMagicFloorRows',
        'setMagicFloorTextEdge',
        'closeMagicFloorPanel',
        'playMagicFloorOpenAnimation',
        'isMagicFloorTouchInsideBoard',
        'getOrCreateOpacity',
        'switchMagicScene',
        'refreshMagicScene',
        'stopMagicScene',
    ],
);
const magicSceneOverrides = magicSceneMethods.filter(
    (methodName) => bottomFeatureShellTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureMagicScene overrides', magicSceneOverrides, []);

const magicSceneTargetMethods = new Set([
    ...bottomFeatureShellTargetMethods,
    ...magicSceneMethods,
]);
const magicMapMethods = concretePrototypeMethods(
    magicMapClass,
    magicMap.sourceFile,
);
assertExactOverrides(
    'HomeFeatureMagicMap methods',
    magicMapMethods,
    [
        'setupMagicMapPages',
        'ensureMagicSkeletonVisual',
        'ensureMagicBattleBackgroundImage',
        'ensureMagicMapMonsterAnchor',
        'setupMagicPlayerHealthInfo',
        'setupMagicMonsterLabel',
        'setupMagicMapHealthInfo',
        'getOrCreateMagicMapHealthLabel',
        'getOrCreateMagicMapHealthSkin',
        'syncMagicMonsterOccupancy',
        'bindMagicMonsterClick',
        'setupMagicMapInput',
        'onMagicMapTouchStart',
        'onMagicMapTouchMove',
        'onMagicMapTouchEnd',
        'moveMagicMapPlayerToTouch',
        'setMagicVisualFacing',
        'clampMagicMapGroundPosition',
        'openMagicMapPanel',
        'loadMagicMapActors',
        'startMagicMapWander',
        'scheduleMagicMonsterWander',
        'stopMagicMapWander',
        'stopMagicMapPlayerMovement',
        'refreshMagicMapDepth',
        'updateMagicMapCountdown',
        'refreshMagicMapTimerLabel',
        'exitMagicMapToFloor',
        'openMagicMonsterTarget',
        'openMagicMonsterRoomPrompt',
        'layoutMagicMonsterRoomPrompt',
        'layoutMagicMonsterRoomButton',
        'hideConfirmNodeForMagicMonsterPrompt',
        'getMagicMonsterRoomPromptName',
    ],
);
const magicMapOverrides = magicMapMethods.filter(
    (methodName) => magicSceneTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureMagicMap overrides', magicMapOverrides, []);

const magicMapTargetMethods = new Set([
    ...magicSceneTargetMethods,
    ...magicMapMethods,
]);
const magicBattleDamageMethods = concretePrototypeMethods(
    magicBattleDamageClass,
    magicBattleDamage.sourceFile,
);
assertExactOverrides(
    'HomeFeatureMagicBattleDamage methods',
    magicBattleDamageMethods,
    [
        'ensureMagicBattleDamageHud',
        'resetMagicBattleDamageState',
        'applyMagicBattlePlayerDamage',
        'refreshMagicBattleDamageHud',
        'refreshMagicBattleDamageRow',
        'applyMagicBattleDamageTextStyle',
        'applyMagicBattleDamageRowEditorTemplate',
        'copyMagicBattleDamageNodeLayout',
        'applyMagicBattleDamageRowLayerOrder',
        'refreshMagicBattleDamageBar',
        'getMagicBattleDamageRanking',
        'getMagicBattlePlayerRank',
        'formatMagicBattleDamageValue',
        'toggleMagicBattleDamagePanel',
        'applyMagicBattleDamagePanelVisibility',
    ],
);
const magicBattleDamageOverrides = magicBattleDamageMethods.filter(
    (methodName) => magicMapTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureMagicBattleDamage overrides', magicBattleDamageOverrides, []);

const magicBattleDamageTargetMethods = new Set([
    ...magicMapTargetMethods,
    ...magicBattleDamageMethods,
]);
const magicBattleDuelMethods = concretePrototypeMethods(
    magicBattleDuelClass,
    magicBattleDuel.sourceFile,
);
assertExactOverrides(
    'HomeFeatureMagicBattleDuel methods',
    magicBattleDuelMethods,
    [
        'ensureMagicBattleDuelPopup',
        'createMagicBattleDuelCard',
        'openMagicBattleDuelPopup',
        'refreshMagicBattleDuelPopup',
        'setMagicBattleDuelCardState',
        'startMagicBattleDuelSequence',
        'playMagicBattleDuelStrike',
        'finishMagicBattleDuel',
        'closeMagicBattleDuelPopup',
    ],
);
const magicBattleDuelOverrides = magicBattleDuelMethods.filter(
    (methodName) => magicBattleDamageTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureMagicBattleDuel overrides', magicBattleDuelOverrides, []);

const magicBattleDuelTargetMethods = new Set([
    ...magicBattleDamageTargetMethods,
    ...magicBattleDuelMethods,
]);
const magicBattleMethods = concretePrototypeMethods(
    magicBattleClass,
    magicBattle.sourceFile,
);
assertExactOverrides(
    'HomeFeatureMagicBattle methods',
    magicBattleMethods,
    [
        'openMagicDuelResult',
        'startMagicMonsterBattle',
        'updateMagicMonsterBattle',
        'playMagicBattleOneShot',
        'refreshMagicBattleHp',
        'getMagicMonsterDisplayIndex',
        'getMagicMonsterRewardItems',
        'finishMagicMonsterBattle',
        'prepareMagicMonsterBattleRewardScene',
        'stopMagicMonsterBattle',
        'returnToMagicMap',
        'returnToMagicScenePanel',
        'openMagicFloorReservedPage',
    ],
);
const magicBattleOverrides = magicBattleMethods.filter(
    (methodName) => magicBattleDuelTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureMagicBattle overrides', magicBattleOverrides, []);

const magicBattleTargetMethods = new Set([
    ...magicBattleDuelTargetMethods,
    ...magicBattleMethods,
]);
const beastStrengthenRulesMethods = concretePrototypeMethods(
    beastStrengthenRulesClass,
    beastStrengthenRules.sourceFile,
);
assertExactOverrides(
    'HomeFeatureBeastStrengthenRules methods',
    beastStrengthenRulesMethods,
    [
        'ensureBeastStrengthenState',
        'seedBeastStrengthenDefaultGemSlots',
        'saveBeastStrengthenState',
        'spendBeastStrengthenYuanbao',
        'getCurrentBeastStrengthenBeast',
        'getBeastStrengthenEquipmentConfigs',
        'getSelectedBeastStrengthenEquipmentConfig',
        'getBeastStrengthenGemItems',
        'getBeastStrengthenGemLevel',
        'getBeastStrengthenTotalBonus',
        'isBeastStrengthenEquipmentUnlocked',
        'isBeastStrengthenGemSlotUnlocked',
        'getBeastStrengthenEquipmentKey',
        'getBeastStrengthenGemSlotKey',
        'getBeastStrengthenActionText',
        'setNodeOpacity',
    ],
);
const beastStrengthenRulesOverrides = beastStrengthenRulesMethods.filter(
    (methodName) => magicBattleTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureBeastStrengthenRules overrides', beastStrengthenRulesOverrides, []);

const beastStrengthenRulesTargetMethods = new Set([
    ...magicBattleTargetMethods,
    ...beastStrengthenRulesMethods,
]);
const beastCardPresentationMethods = concretePrototypeMethods(
    beastCardPresentationClass,
    beastCardPresentation.sourceFile,
);
assertExactOverrides(
    'HomeFeatureBeastCardPresentation methods',
    beastCardPresentationMethods,
    [
        'getOrCreateBeastCardNode',
        'getOrCreateBeastCardSkinnedNode',
        'getOrCreateBeastCardLabel',
        'clearBeastCardLegacyBottomInfo',
        'ensureBeastCardBottomNameLabel',
        'ensureBeastCardRewardArea',
        'refreshBeastCardOutputInfo',
        'switchBeastCard',
        'refreshBeastCard',
        'stopBeastCard',
        'updateBeastCardCountdown',
    ],
);
const beastCardPresentationOverrides = beastCardPresentationMethods.filter(
    (methodName) => beastStrengthenRulesTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureBeastCardPresentation overrides', beastCardPresentationOverrides, []);

const beastCardPresentationTargetMethods = new Set([
    ...beastStrengthenRulesTargetMethods,
    ...beastCardPresentationMethods,
]);
const beastCardRecordMethods = concretePrototypeMethods(
    beastCardRecordClass,
    beastCardRecord.sourceFile,
);
assertExactOverrides(
    'HomeFeatureBeastCardRecord methods',
    beastCardRecordMethods,
    [
        'ensureBeastCardRecordPopup',
        'openBeastCardRecordPopup',
        'closeBeastCardRecordPopup',
        'refreshBeastCardRecordPopup',
        'applyBeastCardRecordRow',
        'formatBeastCardRecordRichText',
        'applyBeastCardRecordTextStyle',
        'getBeastCardOutputRecords',
        'getOrCreateBeastCardChildNode',
        'getOrCreateBeastCardChildSkinnedNode',
        'getOrCreateBeastCardChildLabel',
    ],
);
const beastCardRecordOverrides = beastCardRecordMethods.filter(
    (methodName) => beastCardPresentationTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureBeastCardRecord overrides', beastCardRecordOverrides, []);

const beastCardRecordTargetMethods = new Set([
    ...beastCardPresentationTargetMethods,
    ...beastCardRecordMethods,
]);
const beastCardShellMethods = concretePrototypeMethods(
    beastCardShellClass,
    beastCardShell.sourceFile,
);
assertExactOverrides(
    'HomeFeatureBeastCardShell methods',
    beastCardShellMethods,
    [
        'ensureBeastCardPanel',
        'ensureBeastCardStrengthenButton',
        'ensureBeastCardYuanbaoRatePanel',
        'getBeastCardYuanbaoRateText',
    ],
);
const beastCardShellOverrides = beastCardShellMethods.filter(
    (methodName) => beastCardRecordTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureBeastCardShell overrides', beastCardShellOverrides, []);

const beastCardShellTargetMethods = new Set([
    ...beastCardRecordTargetMethods,
    ...beastCardShellMethods,
]);
const beastStrengthenPageMethods = concretePrototypeMethods(
    beastStrengthenPageClass,
    beastStrengthenPage.sourceFile,
);
assertExactOverrides(
    'HomeFeatureBeastStrengthenPage methods',
    beastStrengthenPageMethods,
    [
        'ensureBeastStrengthenPage',
        'openBeastStrengthenPage',
        'closeBeastStrengthenPage',
        'getOrCreateBeastStrengthenLabel',
        'applyBeastStrengthenTextOutline',
        'layoutBeastStrengthenActionLabel',
        'layoutBeastStrengthenButtonLabel',
        'ensureBeastStrengthenGemSelectPopup',
        'closeBeastStrengthenGemSelectPopup',
    ],
);
const beastStrengthenPageOverrides = beastStrengthenPageMethods.filter(
    (methodName) => beastCardShellTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureBeastStrengthenPage overrides', beastStrengthenPageOverrides, []);

const beastStrengthenPageTargetMethods = new Set([
    ...beastCardShellTargetMethods,
    ...beastStrengthenPageMethods,
]);
const beastStrengthenInteractionMethods = concretePrototypeMethods(
    beastStrengthenInteractionClass,
    beastStrengthenInteraction.sourceFile,
);
assertExactOverrides(
    'HomeFeatureBeastStrengthenInteraction methods',
    beastStrengthenInteractionMethods,
    [
        'refreshBeastStrengthenPage',
        'refreshBeastStrengthenEquipmentSlot',
        'applyBeastStrengthenEquipSelectedFrameSkin',
        'refreshBeastStrengthenCenterEquipment',
        'refreshBeastStrengthenGemSlots',
        'refreshBeastStrengthenBonus',
        'refreshBeastStrengthenActionButton',
        'shouldShowBeastStrengthenRemoveGemButton',
        'handleBeastStrengthenEquipmentClick',
        'handleBeastStrengthenGemSlotClick',
        'handleBeastStrengthenActionButtonClick',
        'handleBeastStrengthenRemoveGemButtonClick',
        'openBeastStrengthenEquipmentConfirm',
        'openBeastStrengthenGemSlotConfirm',
        'openBeastStrengthenGemSelectPopup',
        'createBeastGemSelectCell',
        'placeBeastStrengthenGem',
    ],
);
const beastStrengthenInteractionOverrides = beastStrengthenInteractionMethods.filter(
    (methodName) => beastStrengthenPageTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureBeastStrengthenInteraction overrides', beastStrengthenInteractionOverrides, []);

const beastStrengthenInteractionTargetMethods = new Set([
    ...beastStrengthenPageTargetMethods,
    ...beastStrengthenInteractionMethods,
]);
const battleEntryMethods = concretePrototypeMethods(
    battleEntryClass,
    battleEntry.sourceFile,
);
assertExactOverrides(
    'HomeFeatureBattleEntry methods',
    battleEntryMethods,
    [
        'openBattlePanel',
        'closeBattlePanel',
        'buildBattlePanel',
        'getOrCreateBattleNode',
        'getOrCreateBattleSkinnedNode',
        'getOrCreateBattleLabel',
        'createBattleEntryUi',
        'createBattleLevelSubtitle',
        'createBattleDailyChallengeCount',
        'getBattleEntryMaterials',
        'createBattleEntryMaterialBar',
        'createBattleEntryActionButtons',
        'createBattleChallengeLimitHint',
        'createBattleTicketCost',
    ],
);
const battleEntryOverrides = battleEntryMethods.filter(
    (methodName) => beastStrengthenInteractionTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureBattleEntry overrides', battleEntryOverrides, []);

const battleEntryTargetMethods = new Set([
    ...beastStrengthenInteractionTargetMethods,
    ...battleEntryMethods,
]);
const battleUpgradeMethods = concretePrototypeMethods(
    battleUpgradeClass,
    battleUpgrade.sourceFile,
);
assertExactOverrides(
    'HomeFeatureBattleUpgrade methods',
    battleUpgradeMethods,
    [
        'openBattleUpgradePopup',
        'closeBattleUpgradePopup',
        'ensureBattleUpgradePopup',
        'createBattleUpgradeCard',
        'createBattleUpgradeOutputPanels',
        'createBattleUpgradeOutputPanel',
        'createBattleUpgradeMaterialBar',
        'createBattleUpgradeConfirmButton',
        'handleBattleUpgradeConfirm',
    ],
);
const battleUpgradeOverrides = battleUpgradeMethods.filter(
    (methodName) => battleEntryTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureBattleUpgrade overrides', battleUpgradeOverrides, []);

const battleUpgradeTargetMethods = new Set([
    ...battleEntryTargetMethods,
    ...battleUpgradeMethods,
]);
const battleChallengeMethods = concretePrototypeMethods(
    battleChallengeClass,
    battleChallenge.sourceFile,
);
assertExactOverrides(
    'HomeFeatureBattleChallenge methods',
    battleChallengeMethods,
    [
        'openBattleChallengeConfirmPopup',
        'openBattleTargetChallengePopup',
        'openBattleAutoHostConfirmPopup',
        'closeBattleTargetChallengePopup',
        'ensureBattleTargetChallengePopup',
        'createBattleTargetChallengeOptions',
        'createBattleTargetChallengeConfirmMessage',
        'createBattleTargetChallengeActionButtons',
        'selectBattleTargetChallengeOption',
        'refreshBattleTargetChallengePopup',
        'getBattleChallengeConfirmMessage',
        'handleBattleTargetChallengeConfirm',
        'confirmBattleAutoHost',
        'queueBattleHostedRewards',
    ],
);
const battleChallengeOverrides = battleChallengeMethods.filter(
    (methodName) => battleUpgradeTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureBattleChallenge overrides', battleChallengeOverrides, []);

const battleChallengeTargetMethods = new Set([
    ...battleUpgradeTargetMethods,
    ...battleChallengeMethods,
]);
const battleCombatMethods = concretePrototypeMethods(
    battleCombatClass,
    battleCombat.sourceFile,
);
assertExactOverrides(
    'HomeFeatureBattleCombat methods',
    battleCombatMethods,
    [
        'resetBattlePanelToEntry',
        'startBattleChallenge',
        'buildBattleCombatLayer',
        'createBattleAutoHostButton',
        'loadBattleCombatAssets',
        'playBattleCombatSequence',
        'startBattleWave',
        'applyBattleMonsterSkin',
        'updateBattleWaveLabel',
        'finishCurrentBattleWave',
        'startNextBattleWave',
        'hideBattleMonsterWave',
        'playBattleMonsterAnimation',
        'startBattleRoleAttack',
        'playBattleRoleAttack',
        'updateBattleAttackLoop',
        'playBattleRoleAttackTick',
        'raiseBattleCombatRoleLayer',
        'playBattleRoleAttackAnimation',
        'getBattleRoleAttackFallbackDuration',
        'getTrackAnimationDuration',
        'playBattleMonsterHurt',
        'spawnBattleDamageNumber',
        'getBattleDamageValue',
        'clearBattleDamageNumbers',
    ],
);
const battleCombatOverrides = battleCombatMethods.filter(
    (methodName) => battleChallengeTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureBattleCombat overrides', battleCombatOverrides, []);

const battleCombatTargetMethods = new Set([
    ...battleChallengeTargetMethods,
    ...battleCombatMethods,
]);
const battleRewardMethods = concretePrototypeMethods(
    battleRewardClass,
    battleReward.sourceFile,
);
assertExactOverrides(
    'HomeFeatureBattleReward methods',
    battleRewardMethods,
    [
        'ensureBattleRewardPopup',
        'openBattleRewardPopup',
        'populateBattleRewardItems',
        'getBattleRewardItems',
        'createBattleRewardItem',
        'playBattleRewardTextAnimation',
        'startBattleRewardTextLoop',
        'hideBattleRewardPopup',
        'closeBattleRewardPopupAndReturn',
        'finishBattleChallenge',
        'returnToBattleEntryFromResult',
    ],
);
const battleRewardOverrides = battleRewardMethods.filter(
    (methodName) => battleCombatTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureBattleReward overrides', battleRewardOverrides, []);

const battleRewardTargetMethods = new Set([
    ...battleCombatTargetMethods,
    ...battleRewardMethods,
]);
const battleLifecycleMethods = concretePrototypeMethods(
    battleLifecycleClass,
    battleLifecycle.sourceFile,
);
assertExactOverrides(
    'HomeFeatureBattleLifecycle methods',
    battleLifecycleMethods,
    [
        'stopBattleChallengeSequence',
        'stopBattleTweens',
        'setBattleTitle',
        'raiseBattleTopControls',
        'loadBattleBackgroundSkeletonData',
        'playBattleBackgroundAnimation',
        'stopBattleBackgroundAnimation',
    ],
);
const battleLifecycleOverrides = battleLifecycleMethods.filter(
    (methodName) => battleRewardTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureBattleLifecycle overrides', battleLifecycleOverrides, []);

const battleLifecycleTargetMethods = new Set([
    ...battleRewardTargetMethods,
    ...battleLifecycleMethods,
]);
const adventureMethods = concretePrototypeMethods(adventureClass, adventure.sourceFile);
const adventureOverrides = adventureMethods.filter(
    (methodName) => battleLifecycleTargetMethods.has(methodName),
);
assertExactOverrides(
    'HomeViewAdventure',
    adventureOverrides,
    ['openSharedFlowPopup'],
);

const adventureTargetMethods = new Set([...battleLifecycleTargetMethods, ...adventureMethods]);
const noticeMethods = concretePrototypeMethods(
    noticeClass,
    notice.sourceFile,
);
assertExactOverrides(
    'HomeFeatureNotice methods',
    noticeMethods,
    [
        'ensureNoticeData',
        'createDefaultNotices',
        'openNoticePanel',
        'buildNoticePanel',
        'bindEditorNoticePanel',
        'closeNoticePanel',
        'refreshNoticePanel',
        'createNoticeArticleTemplate',
        'createNoticeArticleFromTemplate',
        'calculateNoticeArticleHeight',
        'estimateNoticeTextHeight',
        'clearNoticeArticleRuntimeChildren',
        'setupNoticeScrollView',
        'getNoticeTypeText',
        'formatTodayKey',
    ],
);
const noticeOverrides = noticeMethods.filter(
    (methodName) => adventureTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureNotice overrides', noticeOverrides, []);

const noticeTargetMethods = new Set([
    ...adventureTargetMethods,
    ...noticeMethods,
]);
const rankMethods = concretePrototypeMethods(
    rankClass,
    rank.sourceFile,
);
assertExactOverrides(
    'HomeFeatureRank methods',
    rankMethods,
    [
        'openRankPanel',
        'buildRankPanel',
        'bindEditorRankPanel',
        'closeRankPanel',
        'switchRankTab',
        'refreshRankPanel',
        'refreshRankTabs',
        'createRankTab',
        'createRankTopCard',
        'updateRankTopCard',
        'createRankRowTemplate',
        'refreshRankRows',
        'createRankRowFromTemplate',
        'clearSpriteFrame',
        'clearRankRows',
        'setupRankScrollView',
        'getRankPlayers',
        'setRankLabel',
        'applyStrongTextStyle',
        'applyRankListTextStyle',
    ],
);
const rankOverrides = rankMethods.filter(
    (methodName) => noticeTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureRank overrides', rankOverrides, []);

const rankTargetMethods = new Set([
    ...noticeTargetMethods,
    ...rankMethods,
]);
const mailDataMethods = concretePrototypeMethods(
    mailData.classNode,
    mailData.sourceFile,
);
assertExactOverrides(
    'HomeFeatureMailData methods',
    mailDataMethods,
    [
        'ensureMailData',
        'createDefaultMails',
        'saveMails',
        'queueBattleHostedRewards',
    ],
);
const mailDataOverrides = mailDataMethods.filter(
    (methodName) => rankTargetMethods.has(methodName),
);
assertExactOverrides(
    'HomeFeatureMailData overrides',
    mailDataOverrides,
    ['queueBattleHostedRewards'],
);

const mailDataTargetMethods = new Set([
    ...rankTargetMethods,
    ...mailDataMethods,
]);
const mailPanelMethods = concretePrototypeMethods(
    mailPanel.classNode,
    mailPanel.sourceFile,
);
assertExactOverrides(
    'HomeFeatureMailPanel methods',
    mailPanelMethods,
    [
        'openMailPanel',
        'buildMailPanel',
        'bindEditorMailPanel',
        'bindExistingEditorMailBoard',
        'rebuildSimpleMailBoard',
        'createMailEmptyLabel',
        'bindEditorButton',
        'ensureButtonText',
        'createMailRowTemplate',
        'createMailTab',
        'switchMailTab',
        'refreshMailTabs',
        'getVisibleMails',
        'closeMailPanel',
        'refreshMailPanel',
        'createMailRow',
        'createMailRowFromTemplate',
        'setMailRowLabel',
        'configureMailRowClaimButton',
        'clearMailListRuntimeChildren',
    ],
);
const mailPanelOverrides = mailPanelMethods.filter(
    (methodName) => mailDataTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureMailPanel overrides', mailPanelOverrides, []);

const mailPanelTargetMethods = new Set([
    ...mailDataTargetMethods,
    ...mailPanelMethods,
]);
const mailDetailMethods = concretePrototypeMethods(
    mailDetail.classNode,
    mailDetail.sourceFile,
);
assertExactOverrides(
    'HomeFeatureMailDetail methods',
    mailDetailMethods,
    [
        'openMailDetail',
        'openBattleHostMailDetail',
        'createMailRewardGrid',
        'resolveMailRewardItem',
        'createMailDetailActionButton',
        'closeMailDetail',
        'getMailRewardPopupItems',
        'claimMailReward',
        'applyMailRewardsToInventory',
        'parseMailRewardCount',
        'claimAllMailRewards',
        'deleteMail',
        'deleteReadMails',
        'updateMailBadge',
        'createMailButton',
        'clearChildren',
        'getMailStateText',
        'formatMailTime',
        'formatMailShortTime',
        'getMailPreview',
        'formatMailRemainTime',
        'formatRewardList',
    ],
);
const mailDetailOverrides = mailDetailMethods.filter(
    (methodName) => mailPanelTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureMailDetail overrides', mailDetailOverrides, []);

const mailDetailTargetMethods = new Set([
    ...mailPanelTargetMethods,
    ...mailDetailMethods,
]);
const marketShellMethods = concretePrototypeMethods(
    marketShell.classNode,
    marketShell.sourceFile,
);
assertExactOverrides(
    'HomeFeatureMarketShell methods',
    marketShellMethods,
    [
        'openMarketPanel',
        'openMarketPanelWhenReady',
        'buildMarketPanel',
        'createMarketFilterSelect',
        'closeMarketPanel',
        'getMarketTabTitle',
        'refreshMarketTabLabels',
        'getMarketModeButtonSkinPaths',
        'preloadMarketModeButtonSpriteFrames',
        'setMarketModeButtonsVisible',
        'applyMarketModeButtonSkin',
        'createMarketModeButtons',
        'switchMarketMode',
        'refreshMarketModeButtonState',
        'switchMarketTab',
        'isMarketSellManagePage',
        'getMarketListingMode',
        'getCurrentMarketPostedListings',
        'isMarketRequestPostPage',
        'getMarketPostLimitText',
        'getMarketPostFullSuccessText',
        'getMarketPostSuccessText',
        'getMarketPostDoneLabel',
        'getMarketPostDetailTitle',
        'getMarketPostPriceRangePrefix',
        'cycleMarketCategory',
        'getMarketPrimaryFilterKey',
        'getMarketFilterOptions',
        'getMarketFilterSelectedKey',
        'getMarketFilterNode',
        'getMarketFilterDropdownIconNode',
        'refreshMarketFilterDropdownIcons',
        'getMarketFilterTitle',
        'openMarketFilterDropdown',
        'closeMarketFilterDropdown',
        'selectMarketFilter',
        'toggleMarketSort',
        'refreshMarketFilterLabels',
        'getMarketCurrentAction',
        'getMarketActionButtonText',
        'getMarketDetailActionText',
        'getMarketConfirmTitle',
        'getMarketSuccessTitle',
        'getMarketHistoryEmptyText',
        'getMarketTransactionStatus',
        'getMarketRecordTitle',
        'marketFilterMatchesOption',
        'marketListingMatchesFilters',
        'refreshMarketList',
    ],
);
const marketShellOverrides = marketShellMethods.filter(
    (methodName) => mailDetailTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureMarketShell overrides', marketShellOverrides, []);

const marketShellTargetMethods = new Set([
    ...mailDetailTargetMethods,
    ...marketShellMethods,
]);
const marketSellMethods = concretePrototypeMethods(
    marketSell.classNode,
    marketSell.sourceFile,
);
assertExactOverrides(
    'HomeFeatureMarketSell methods',
    marketSellMethods,
    [
        'buildMarketSellListingPage',
        'createMarketSellAddRow',
        'createMarketSellPostedRow',
        'getMarketSellPostedItemCount',
        'getAvailableMarketSellItemCount',
        'getMarketSellCandidateItems',
        'openMarketSellItemSelectPopup',
        'createMarketSellSelectItem',
        'handleMarketSellItemSelected',
        'closeMarketSellItemSelectPopup',
        'getMarketSellPriceRange',
        'findMarketFilterGroupTitle',
        'getMarketSellCategoryPath',
        'roundMarketSellPrice',
        'getMarketSellFinalIncome',
        'getMarketPostTotalCost',
        'getMarketPostMaxQuantity',
        'setMarketSellDraftQuantity',
        'setMarketSellDraftUnitPrice',
        'adjustMarketSellDraftQuantity',
        'adjustMarketSellDraftUnitPrice',
        'createMarketSellSettingRow',
        'refreshMarketSellConfirmDraftLabels',
        'openMarketSellConfirmPopup',
        'closeMarketSellConfirmPopup',
        'confirmMarketSellListing',
    ],
);
const marketSellOverrides = marketSellMethods.filter(
    (methodName) => marketShellTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureMarketSell overrides', marketSellOverrides, []);

const marketSellTargetMethods = new Set([
    ...marketShellTargetMethods,
    ...marketSellMethods,
]);
const marketTradeMethods = concretePrototypeMethods(
    marketTrade.classNode,
    marketTrade.sourceFile,
);
assertExactOverrides(
    'HomeFeatureMarketTrade methods',
    marketTradeMethods,
    [
        'openMarketSellListingDetail',
        'clampMarketListScroll',
        'getMarketListingLayoutTemplate',
        'applyMarketListingChildLayout',
        'createMarketListingRow',
        'handleMarketAction',
        'completeMarketAction',
        'buildMarketHistoryList',
        'applyMarketHistoryLogRow',
        'formatMarketHistoryRichText',
        'formatMarketTransactionTime',
        'openMarketTransactionDetail',
        'applyMarketTextStyle',
        'getMarketTotalPrice',
        'formatMarketPrice',
        'applyMarketFilterTextStyle',
        'applyMarketDropdownTextStyle',
    ],
);
const marketTradeOverrides = marketTradeMethods.filter(
    (methodName) => marketSellTargetMethods.has(methodName),
);
assertExactOverrides('HomeFeatureMarketTrade overrides', marketTradeOverrides, []);

const marketTradeTargetMethods = new Set([
    ...marketSellTargetMethods,
    ...marketTradeMethods,
]);
const shopMethods = concretePrototypeMethods(
    shop.classNode,
    shop.sourceFile,
);
assertExactOverrides(
    'HomeFeatureShop methods',
    shopMethods,
    [
        'createSlicedSkinnedNode',
        'applySlicedUiSkin',
        'openShopPanel',
        'buildShopPanel',
        'prepareEditorShopPanel',
        'createShopPageLayout',
        'playShopCharacterAnimation',
        'closeShopPanel',
        'refreshShopPanel',
        'refreshEditorShopItems',
        'updateEditorShopItemCell',
        'applyEditorShopSkin',
        'updateEditorShopLabel',
        'createShopItemCell',
        'getSoulCurrencyText',
        'getPointCurrencyText',
        'applyShopLabelStyle',
        'openShopBuyConfirm',
        'openShopItemDetail',
        'completeShopPurchase',
        'createShopCurrencyIcon',
        'ensureShopStore',
        'saveShopStore',
        'updateShopCurrencyLabels',
        'formatCurrency',
    ],
);
const shopOverrides = shopMethods.filter(
    (methodName) => marketTradeTargetMethods.has(methodName),
);
assertExactOverrides(
    'HomeFeatureShop overrides',
    shopOverrides,
    [],
);

const main = parseSource('MainHomeView.ts');
if (main.source.includes('extends HomeViewAdventure')) {
    fail('MainHomeView must compose HomeViewAdventure instead of inheriting it');
}
if (main.source.includes('extends HomeViewRoleBag')) {
    fail('MainHomeView must compose HomeViewRoleBag instead of inheriting it');
}
if (!main.source.includes('composeStatefulFeature(')
    || !main.source.includes('HomeViewBase,')
    || !main.source.includes('HomeViewRoleBag,')
    || !main.source.includes('HomeViewRoleBag.initializeFeatureState,')
) {
    fail('MainHomeView is missing the stateful HomeViewRoleBag composition');
}
if (!main.source.includes('RoleBagFeature.initialize(this);')) {
    fail('MainHomeView.onLoad must initialize HomeViewRoleBag state');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('RoleBagFeature.componentClass,')
    || !main.source.includes('HomeFeatureDuelRecord,')
    || !main.source.includes('const DuelRecordFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureDuelRecord composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('DuelRecordFeature,')
    || !main.source.includes('HomeFeatureDuelRank,')
    || !main.source.includes('const DuelRankFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureDuelRank composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('DuelRankFeature,')
    || !main.source.includes('HomeFeatureDuelInvest,')
    || !main.source.includes('const DuelInvestFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureDuelInvest composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('DuelInvestFeature,')
    || !main.source.includes('HomeFeatureDuelRoundClock,')
    || !main.source.includes('const DuelRoundClockFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureDuelRoundClock composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('DuelRoundClockFeature,')
    || !main.source.includes('HomeFeatureDuelRoundResolution,')
    || !main.source.includes('const DuelRoundResolutionFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureDuelRoundResolution composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('DuelRoundResolutionFeature,')
    || !main.source.includes('HomeFeatureDuelActorRuntime,')
    || !main.source.includes('const DuelActorRuntimeFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureDuelActorRuntime composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('DuelActorRuntimeFeature,')
    || !main.source.includes('HomeFeatureDuelSceneUI,')
    || !main.source.includes('const DuelSceneUIFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureDuelSceneUI composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('DuelSceneUIFeature,')
    || !main.source.includes('HomeFeatureDuelLobby,')
    || !main.source.includes('const DuelLobbyFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureDuelLobby composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('DuelLobbyFeature,')
    || !main.source.includes('HomeFeatureShowcase,')
    || !main.source.includes('const ShowcaseFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureShowcase composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('ShowcaseFeature,')
    || !main.source.includes('HomeFeatureItemDetail,')
    || !main.source.includes('const ItemDetailFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureItemDetail composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('ItemDetailFeature,')
    || !main.source.includes('HomeFeatureCommerceConfirm,')
    || !main.source.includes('const CommerceConfirmFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureCommerceConfirm composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('CommerceConfirmFeature,')
    || !main.source.includes('HomeFeatureBag,')
    || !main.source.includes('const BagFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureBag composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('BagFeature,')
    || !main.source.includes('HomeFeatureRoleEquipment,')
    || !main.source.includes('const RoleEquipmentFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureRoleEquipment composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('RoleEquipmentFeature,')
    || !main.source.includes('HomeFeatureRoleProgression,')
    || !main.source.includes('const RoleProgressionFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureRoleProgression composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('RoleProgressionFeature,')
    || !main.source.includes('HomeFeatureRoleAdvance,')
    || !main.source.includes('const RoleAdvanceFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureRoleAdvance composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('RoleAdvanceFeature,')
    || !main.source.includes('HomeFeatureRoleStrengthen,')
    || !main.source.includes('const RoleStrengthenFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureRoleStrengthen composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('RoleStrengthenFeature,')
    || !main.source.includes('HomeFeatureCharacterCreationUI,')
    || !main.source.includes('const CharacterCreationUIFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureCharacterCreationUI composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('CharacterCreationUIFeature,')
    || !main.source.includes('HomeFeatureCharacter,')
    || !main.source.includes('const CharacterFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureCharacter composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('CharacterFeature,')
    || !main.source.includes('HomeFeatureGiftShare,')
    || !main.source.includes('const GiftShareFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureGiftShare composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('GiftShareFeature,')
    || !main.source.includes('HomeFeatureProfileShell,')
    || !main.source.includes('const ProfileShellFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureProfileShell composition');
}
if (!main.source.includes('ProfileShellFeature,')
    || !main.source.includes('HomeFeatureProfileAvatarFrame,')
    || !main.source.includes('const ProfileAvatarFrameFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureProfileAvatarFrame composition');
}
if (!main.source.includes('ProfileAvatarFrameFeature,')
    || !main.source.includes('HomeFeatureProfileSettings,')
    || !main.source.includes('const ProfileSettingsFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureProfileSettings composition');
}
if (!main.source.includes('ProfileSettingsFeature,')
    || !main.source.includes('HomeFeatureHomeUIRoot,')
    || !main.source.includes('const HomeUIRootFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureHomeUIRoot composition');
}
if (!main.source.includes('HomeUIRootFeature,')
    || !main.source.includes('HomeFeatureHomeSceneShell,')
    || !main.source.includes('const HomeSceneShellFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureHomeSceneShell composition');
}
if (!main.source.includes('HomeSceneShellFeature,')
    || !main.source.includes('HomeFeatureAssetRuntime,')
    || !main.source.includes('const AssetRuntimeFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureAssetRuntime composition');
}
if (!main.source.includes('AssetRuntimeFeature,')
    || !main.source.includes('HomeFeatureRoleVisualRuntime,')
    || !main.source.includes('const RoleVisualRuntimeFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureRoleVisualRuntime composition');
}
if (!main.source.includes('RoleVisualRuntimeFeature,')
    || !main.source.includes('HomeFeatureWorldMovement,')
    || !main.source.includes('const WorldMovementFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureWorldMovement composition');
}
if (!main.source.includes('WorldMovementFeature,')
    || !main.source.includes('HomeFeatureToast,')
    || !main.source.includes('const ToastFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureToast composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('ToastFeature,')
    || !main.source.includes('HomeFeatureRoleDisplay,')
    || !main.source.includes('const RoleDisplayFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureRoleDisplay composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('RoleDisplayFeature,')
    || !main.source.includes('HomeFeatureTransitionLoading,')
    || !main.source.includes('const TransitionLoadingFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureTransitionLoading composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('TransitionLoadingFeature,')
    || !main.source.includes('HomeFeatureBottomFeatureShell,')
    || !main.source.includes('const BottomFeatureShellFeature =')
    || !main.source.includes("overrides: ['closeOtherBottomEntryPages']")
) {
    fail('MainHomeView is missing the explicit HomeFeatureBottomFeatureShell composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('BottomFeatureShellFeature,')
    || !main.source.includes('HomeFeatureMagicScene,')
    || !main.source.includes('const MagicSceneFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureMagicScene composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('MagicSceneFeature,')
    || !main.source.includes('HomeFeatureMagicMap,')
    || !main.source.includes('const MagicMapFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureMagicMap composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('MagicMapFeature,')
    || !main.source.includes('HomeFeatureMagicBattleDamage,')
    || !main.source.includes('const MagicBattleDamageFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureMagicBattleDamage composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('MagicBattleDamageFeature,')
    || !main.source.includes('HomeFeatureMagicBattleDuel,')
    || !main.source.includes('const MagicBattleDuelFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureMagicBattleDuel composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('MagicBattleDuelFeature,')
    || !main.source.includes('HomeFeatureMagicBattle,')
    || !main.source.includes('const MagicBattleFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureMagicBattle composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('MagicBattleFeature,')
    || !main.source.includes('HomeFeatureBeastStrengthenRules,')
    || !main.source.includes('const BeastStrengthenRulesFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureBeastStrengthenRules composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('BeastStrengthenRulesFeature,')
    || !main.source.includes('HomeFeatureBeastCardPresentation,')
    || !main.source.includes('const BeastCardPresentationFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureBeastCardPresentation composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('BeastCardPresentationFeature,')
    || !main.source.includes('HomeFeatureBeastCardRecord,')
    || !main.source.includes('const BeastCardRecordFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureBeastCardRecord composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('BeastCardRecordFeature,')
    || !main.source.includes('HomeFeatureBeastCardShell,')
    || !main.source.includes('const BeastCardShellFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureBeastCardShell composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('BeastCardShellFeature,')
    || !main.source.includes('HomeFeatureBeastStrengthenPage,')
    || !main.source.includes('const BeastStrengthenPageFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureBeastStrengthenPage composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('BeastStrengthenPageFeature,')
    || !main.source.includes('HomeFeatureBeastStrengthenInteraction,')
    || !main.source.includes('const BeastStrengthenInteractionFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureBeastStrengthenInteraction composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('BeastStrengthenInteractionFeature,')
    || !main.source.includes('HomeFeatureBattleEntry,')
    || !main.source.includes('const BattleEntryFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureBattleEntry composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('BattleEntryFeature,')
    || !main.source.includes('HomeFeatureBattleUpgrade,')
    || !main.source.includes('const BattleUpgradeFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureBattleUpgrade composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('BattleUpgradeFeature,')
    || !main.source.includes('HomeFeatureBattleChallenge,')
    || !main.source.includes('const BattleChallengeFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureBattleChallenge composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('BattleChallengeFeature,')
    || !main.source.includes('HomeFeatureBattleCombat,')
    || !main.source.includes('const BattleCombatFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureBattleCombat composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('BattleCombatFeature,')
    || !main.source.includes('HomeFeatureBattleReward,')
    || !main.source.includes('const BattleRewardFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureBattleReward composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('BattleRewardFeature,')
    || !main.source.includes('HomeFeatureBattleLifecycle,')
    || !main.source.includes('const BattleLifecycleFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureBattleLifecycle composition');
}
if (!main.source.includes('composeStatefulFeature(')
    || !main.source.includes('BattleLifecycleFeature,')
    || !main.source.includes('HomeViewAdventure,')
    || !main.source.includes('HomeViewAdventure.initializeFeatureState,')
) {
    fail('MainHomeView is missing the stateful HomeViewAdventure composition');
}
if (!main.source.includes(
    "overrides: ['openSharedFlowPopup']",
)) {
    fail(
        'HomeViewAdventure override openSharedFlowPopup must remain explicit',
    );
}
if (!main.source.includes('AdventureFeature.initialize(this);')) {
    fail('MainHomeView.onLoad must initialize HomeViewAdventure state');
}
if (main.source.indexOf('AdventureFeature.initialize(this);')
    > main.source.indexOf('applySimKaiFontToTree(this.node);')
) {
    fail('HomeViewAdventure state must initialize at the start of MainHomeView.onLoad');
}
if (main.source.indexOf('RoleBagFeature.initialize(this);')
    > main.source.indexOf('AdventureFeature.initialize(this);')
) {
    fail('HomeViewRoleBag state must initialize before HomeViewAdventure state');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('AdventureFeature.componentClass,')
    || !main.source.includes('HomeFeatureNotice,')
    || !main.source.includes('const NoticeFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureNotice composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('NoticeFeature,')
    || !main.source.includes('HomeFeatureRank,')
    || !main.source.includes('const RankFeature =')
) {
    fail('MainHomeView is missing the stateless HomeFeatureRank composition');
}
if (!main.source.includes('composeStatelessFeature(')
    || !main.source.includes('const MailDataFeature =')
    || !main.source.includes('RankFeature,')
    || !main.source.includes('HomeFeatureMailData,')
    || !main.source.includes("overrides: ['queueBattleHostedRewards']")
) {
    fail('MainHomeView is missing the explicit HomeFeatureMailData composition');
}
if (!main.source.includes('const MailPanelFeature =')
    || !main.source.includes('MailDataFeature,')
    || !main.source.includes('HomeFeatureMailPanel,')
) {
    fail('MainHomeView is missing the stateless HomeFeatureMailPanel composition');
}
if (!main.source.includes('const MailDetailFeature =')
    || !main.source.includes('MailPanelFeature,')
    || !main.source.includes('HomeFeatureMailDetail,')
) {
    fail('MainHomeView is missing the stateless HomeFeatureMailDetail composition');
}
if (!main.source.includes('const MarketShellFeature =')
    || !main.source.includes('MailDetailFeature,')
    || !main.source.includes('HomeFeatureMarketShell,')
) {
    fail('MainHomeView is missing the stateless HomeFeatureMarketShell composition');
}
if (!main.source.includes('const MarketSellFeature =')
    || !main.source.includes('MarketShellFeature,')
    || !main.source.includes('HomeFeatureMarketSell,')
) {
    fail('MainHomeView is missing the stateless HomeFeatureMarketSell composition');
}
if (!main.source.includes('const MarketTradeFeature =')
    || !main.source.includes('MarketSellFeature,')
    || !main.source.includes('HomeFeatureMarketTrade,')
) {
    fail('MainHomeView is missing the stateless HomeFeatureMarketTrade composition');
}
if (!main.source.includes('const HomeViewWithShop =')
    || !main.source.includes('MarketTradeFeature,')
    || !main.source.includes('HomeFeatureShop,')
) {
    fail('MainHomeView is missing the stateless HomeFeatureShop composition');
}
if (!main.source.includes('extends HomeViewWithShop')) {
    fail('MainHomeView must extend the composed HomeViewWithShop constructor');
}

console.log(
    `Home architecture OK (${declaredRoleBagState.length} role/bag state fields and `
    + `${declaredAdventureState.length} adventure state fields initialized, `
    + `${duelRecordMethods.length} duel record, ${duelRankMethods.length} duel rank, `
    + `${duelInvestMethods.length} duel invest, `
    + `${duelRoundClockMethods.length} duel round clock, `
    + `${duelRoundResolutionMethods.length} duel round resolution, `
    + `${duelActorRuntimeMethods.length} duel actor runtime, `
    + `${duelSceneUIMethods.length} duel scene UI, `
    + `${duelLobbyMethods.length} duel lobby, `
    + `${showcaseMethods.length} showcase, `
    + `${itemDetailMethods.length} item detail, `
    + `${commerceConfirmMethods.length} commerce confirm, `
    + `${bagMethods.length} bag, `
    + `${roleEquipmentMethods.length} role equipment, `
    + `${roleProgressionMethods.length} role progression, `
    + `${roleAdvanceMethods.length} role advance, `
    + `${roleStrengthenMethods.length} role strengthen, `
    + `${characterCreationUIMethods.length} character creation UI, `
    + `${characterMethods.length} character, `
    + `${giftShareMethods.length} gift/share, `
    + `${profileShellMethods.length} profile shell, `
    + `${profileAvatarFrameMethods.length} profile avatar frame, `
    + `${profileSettingsMethods.length} profile settings, `
    + `${homeUIRootMethods.length} home UI root, `
    + `${homeSceneShellMethods.length} home scene shell, `
    + `${assetRuntimeMethods.length} asset runtime, `
    + `${roleVisualRuntimeMethods.length} role visual runtime, `
    + `${worldMovementMethods.length} world movement, `
    + `${toastMethods.length} toast, `
    + `${roleDisplayMethods.length} role display, `
    + `${transitionLoadingMethods.length} transition loading, `
    + `${bottomFeatureShellMethods.length} bottom feature shell, `
    + `${magicSceneMethods.length} magic scene, `
    + `${magicMapMethods.length} magic map, `
    + `${magicBattleDamageMethods.length} magic battle damage, `
    + `${magicBattleDuelMethods.length} magic battle duel, `
    + `${magicBattleMethods.length} magic battle, `
    + `${beastStrengthenRulesMethods.length} beast strengthen rules, `
    + `${beastCardPresentationMethods.length} beast card presentation, `
    + `${beastCardRecordMethods.length} beast card record, `
    + `${beastCardShellMethods.length} beast card shell, `
    + `${beastStrengthenPageMethods.length} beast strengthen page, `
    + `${beastStrengthenInteractionMethods.length} beast strengthen interaction, `
    + `${battleEntryMethods.length} battle entry, `
    + `${battleUpgradeMethods.length} battle upgrade, `
    + `${battleChallengeMethods.length} battle challenge, `
    + `${battleCombatMethods.length} battle combat, `
    + `${battleRewardMethods.length} battle reward, `
    + `${battleLifecycleMethods.length} battle lifecycle, `
    + `${noticeMethods.length} notice, ${rankMethods.length} rank, `
    + `${mailDataMethods.length} mail data, ${mailPanelMethods.length} mail panel, `
    + `${mailDetailMethods.length} mail detail, `
    + `${marketShellMethods.length} market shell, ${marketSellMethods.length} market sell, `
    + `${marketTradeMethods.length} market trade, and ${shopMethods.length} shop methods composed; `
    + 'RoleBag, DuelRecord, DuelRank, DuelInvest, DuelRoundClock, DuelRoundResolution, DuelActorRuntime, DuelSceneUI, DuelLobby, Showcase, ItemDetail, CommerceConfirm, Bag, RoleEquipment, RoleProgression, RoleAdvance, RoleStrengthen, CharacterCreationUI, Character, GiftShare, ProfileShell, ProfileAvatarFrame, ProfileSettings, HomeUIRoot, HomeSceneShell, AssetRuntime, RoleVisualRuntime, WorldMovement, Toast, RoleDisplay, TransitionLoading, BottomFeatureShell, MagicScene, MagicMap, MagicBattleDamage, MagicBattleDuel, MagicBattle, BeastStrengthenRules, BeastCardPresentation, BeastCardRecord, BeastCardShell, BeastStrengthenPage, BeastStrengthenInteraction, BattleEntry, BattleUpgrade, BattleChallenge, BattleCombat, BattleReward, BattleLifecycle, Adventure, Notice, Rank, MailData, MailPanel, MailDetail, MarketShell, MarketSell, MarketTrade, and Shop '
    + 'add no runtime inheritance layers; '
    + 'legacy file growth budgets enforced)',
);
