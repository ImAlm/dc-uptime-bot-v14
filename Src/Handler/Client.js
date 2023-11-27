const { Client, Collection, GatewayIntentBits, ModalBuilder, Partials, TextInputBuilder, TextInputStyle,  EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, PermissionsBitField, ButtonStyle,ActivityType, StringSelectMenuBuilder, Colors } = require("discord.js");
const client = global.client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.Reaction, Partials.GuildScheduledEvent, Partials.User, Partials.ThreadMember]});
const { joinVoiceChannel } = require('@discordjs/voice')
const { botSettings } = require('../config.json')

const linkData = require('../Modules/Links')
const premiumData = require('../Modules/PremiumCodes')
const { promisify } = require('util')
const wait = promisify(setTimeout);

class Handler {

    async Start() {

        process.on("unhandledRejection", (err) => { console.log(err) });

        client.login(botSettings.token).then(x => {
            console.log(`[ BOT ] - Sistem başarıyla aktif oldu.`)
        }).catch(err => {
            return console.log(`[ HATA ] - Sistem başlatılırken bir hata ile karşılaşıldı.`)
        })

        function createRandomKey( length ) {

            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            let counter = 0;
            while (counter < length) {
              result += characters.charAt(Math.floor(Math.random() * charactersLength));
              counter += 1;
            }
            return result;

        }

        client.on('ready', async () => {

            const VoiceChannel = client.channels.cache.get(botSettings.voice);

            await joinVoiceChannel({
                channelId: VoiceChannel.id,
                guildId: VoiceChannel.guild.id,
                adapterCreator: VoiceChannel.guild.voiceAdapterCreator,
                selfDeaf: true,
                group: client.user.id
            });
    
            client.user.setActivity(`7 / 24 Uptime`)

            let successLinks = 0;
            let errorLinks = 0;

            async function startUptime() {

                const userLinks = (await linkData.find({})).filter( a => a.links.length > 0)

                for (const loadedUser of userLinks) {
                    await wait(100)
                    for (const project of loadedUser.links) {
                      try {
                        fetch(project.projectLink)
                        successLinks += 1;
                      } catch (err) {
                        errorLinks += 1;
                      }
                    }
                }


                let embed = new EmbedBuilder()
                .setAuthor({name: `Uptime Bildirimi`, iconURL: client.user.displayAvatarURL({dynamic: true})})
                .setColor(Colors.White)
                .setDescription(`Uptime yapıldı.\nBaşarılı olan linkler : **${successLinks}**\nHatalı olan linkler : **${errorLinks}**\n\nSon Uptime Zamanı : **<t:${Math.floor( Date.now() / 1000 )}:R>**`)

                let lastUptimeChannel = client.channels.cache.get(botSettings.lastUptimeChannel)
                await lastUptimeChannel.messages.fetch(botSettings.lastUptimeMessage).then( botMsg => {

                    botMsg.edit({ embeds: [embed], components: [] }).catch((err) => { console.log(err) })
                } ).catch((err) => console.log(err))

                successLinks = 0;
                errorLinks = 0;

            }

            startUptime()
            setInterval(() => startUptime(), 1000 * 60 * 2)

        })

        // Button Setup

        client.on('messageCreate', async (message) => {

            if ( message.guild || ( message.member && message.member.id !== botSettings.developer ) ) return;
            if ( message.content == "link-setup" ) {

                let row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId("addLink").setLabel("Link Ekle").setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId("removeLink").setLabel("Link Çıkar").setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId("myLinks").setLabel("Eklediğim Projeler").setStyle(ButtonStyle.Secondary)
                )

                let content = (
                    `# EXLUSIVE UPTIMER SERVICE # \n\n`
                    + `Uptime linkleri eklerken bir kaç tür hataya rastlanır. Sizin için derledim. Aşağıdaki hatalardan birisi ile karşılaşırsanız lütfen bilgilendirmeyi okuyunuz.\n\n`
                + `**1.Hata** - Bulunamayan URL \`\`\`js\nTypeError: Failed to parse URL from ProjectURL\`\`\`**Bu hatanın çözümü için düzgün bir URL' nin girilmesi lazımdır.**\n\n## Exlusive Uptimer' ı kullandığınız için teşekkür ederiz. ##`
                )

                let channel = client.channels.cache.get(botSettings.uptimeChannel)
                await channel.send({components: [row], content: content})
            }
        })

        client.on('messageCreate', async (message) => {

            if ( message.guild || ( message.member && message.member.id !== botSettings.developer ) ) return;
            if ( message.content == "!code" ) {

                let code = createRandomKey(16)

                message.reply({ content: `Yeni kod oluşturuldu.\n\`\`\`${code}\`\`\`` })
                await premiumData.create({ code: code })
            }
        })

        client.on('messageCreate', async (message) => {

            if ( message.guild || ( message.member && message.member.id !== botSettings.developer ) ) return;
            if ( message.content == "pre-setup" ) {

                let guild = client.guilds.cache.get(botSettings.guildID)

                let row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId("useCode").setLabel("Kod Kullan").setStyle(ButtonStyle.Secondary),
                )

                let embed = new EmbedBuilder()
                .setAuthor({ name: `${guild.name}`, iconURL: guild.iconURL({dynamic: true})})
                .setDescription(`# Kod Sistemi #\n`
                + `> Kodunuzu aşağıdaki \` Kod Kullan \` seçeneğine tıklayarak kullanabilirsiniz.\n\n`
                + `> Verilecek rol : <@&${botSettings.premiumRole}>`
                )
                .setColor(Colors.White)
                .setFooter({text: `Bizi tercih ettiğiniz için teşekkürler!`, iconURL: "https://cdn.discordapp.com/attachments/1107271085189238936/1115643609828556920/deneme.png"})

                let channel = client.channels.cache.get(botSettings.codeChannel)
                await channel.send({components: [row], embeds: [embed]})
            }
        })


        client.on('interactionCreate', async ( interaction ) => {

            if ( interaction.customId && interaction.customId == "useCode" ) {

                if ( interaction.member.roles.cache.has( botSettings.premiumRole ) ) return interaction.reply({content: `Zaten bir premium üyesin.`, ephemeral: true}).catch((err) => {})

                const modal = new ModalBuilder()
                .setCustomId('codeForm')
                .setTitle('Premium Kod Kullan');
    
                const name = new TextInputBuilder()
                .setCustomId('code')
                .setPlaceholder("Kodu giriniz.")
                .setMaxLength(16)
                .setMinLength(16)
                .setLabel("Kod")
                .setRequired(true)
                .setStyle(TextInputStyle.Short);
                
                
                const firstActionRow = new ActionRowBuilder().addComponents(name);
                modal.addComponents(firstActionRow);
    
                await interaction.showModal(modal).catch((err) => { return console.log(err.message) })
            }
        } )

        client.on('interactionCreate', async ( interaction ) => {

            if ( interaction.customId == "codeForm" ) {

                const nameResponse = interaction.fields.getTextInputValue('code');
                if ( interaction.member.roles.cache.has( botSettings.premiumRole ) ) return interaction.reply({content: `Zaten bir premium üyesin.`, ephemeral: true}).catch((err) => {})

                if ( await premiumData.findOne({ code: nameResponse }) ) {

                    interaction.reply({content: `Harika, sen de artık bir premium üyesin!`, ephemeral: true}).catch((err) => {})
                    await premiumData.deleteOne({ code: nameResponse }, { upsert: true })
                    await interaction.member.roles.add( botSettings.premiumRole ).catch((err) => { console.log(err.messsage) })

                    let embed = new EmbedBuilder()
                    .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({dynamic: true})})
                    .setDescription(`${interaction.member} adlı kullanıcı kod kullandı ve <@&${botSettings.premiumRole}> rolü verildi.`)
                    .setColor(Colors.White)

                    let log = interaction.guild.channels.cache.get(botSettings.codeLogs)
                    if ( log ) log.send({embeds: [embed]}).catch((err) => {})
                } else {

                    interaction.reply({content: `Bu şekil bir premium kod bulunamıyor.`, ephemeral: true}).catch((err) => {})
                }
            }
        })

        // Add Link

        client.on('interactionCreate', async (interaction) => {

            if ( interaction.customId == "addLink" ) {

                let userData = await linkData.findOne({userID: interaction.user.id})
                if ( userData && userData.links.length >= 5) return interaction.reply({content: `Link sayın limit sayısına ulaştı. ( **Link Limit Sayısı : 5** )`, ephemeral: true}).catch((err) => { console.log(err.message) })


                const modal = new ModalBuilder()
                .setCustomId('addForm')
                .setTitle('Uptime Link Ekle');
    
                const name = new TextInputBuilder()
                .setCustomId('name')
                .setPlaceholder("Bir proje ismi belirle.")
                .setMaxLength(25)
                .setMinLength(4)
                .setLabel("Proje İsmi")
                .setRequired(true)
                .setStyle(TextInputStyle.Short);
                
    
                const purpose = new TextInputBuilder()
                .setCustomId('link')
                .setMinLength(16)
                .setMaxLength(85)
                .setRequired(true)
                .setLabel("Proje Linki")
                .setPlaceholder("Bir proje linki belirle.")
                .setStyle(TextInputStyle.Short);
                
    
                const firstActionRow = new ActionRowBuilder().addComponents(name);
                const thirdActionRow = new ActionRowBuilder().addComponents(purpose);
                modal.addComponents(firstActionRow, thirdActionRow);
    
                await interaction.showModal(modal).catch((err) => { return console.log(err.message) })

            }
        })

        client.on('interactionCreate', async (interaction) => {

            if ( interaction.customId == "addForm" ) {

                let userData = await linkData.findOne({userID: interaction.user.id})
                if ( userData && !interaction.member.roles.cache.has(botSettings.premiumRole) &&userData.links.length >= 5) return interaction.reply({content: `Link sayın limit sayısına ulaştı. ( **Link Limit Sayısı : 5** )`, ephemeral: true}).catch((err) => { console.log(err.message) })

                if ( userData && interaction.member.roles.cache.has( botSettings.premiumRole ) && userData.links.length >= 15) return interaction.reply({content: `Link sayın premium limit sayısına ulaştı. ( **Premium Link Limit Sayısı : 15** )`})
                const nameResponse = interaction.fields.getTextInputValue('name');
                const linkResponse = interaction.fields.getTextInputValue('link').replaceAll(" ","")

                if (!linkResponse.startsWith("https://") && !linkResponse.startsWith("http://")) return interaction.reply({content: `Proje linki ** https:// ** ile başlamak zorundadır.`, ephemeral: true}).catch((err) => { console.log(err.message) })
                if (!linkResponse.includes("glitch.me") && !linkResponse.includes("replit.com")) return interaction.reply({content: `Proje linki'nin içerisinde **glitch.me** veya **replit.com** içermesi lazımdır.`, ephemeral: true}).catch((err) => { console.log(err.message) })
                if ( userData && userData.links.find(a => a.projectName == nameResponse) ) return interaction.reply({content: `Bu proje isminde projen zaten bulunmaktadır. Başka isimler tercih ediniz.`, ephemeral: true}).catch((err) => { console.log(err.message) })
                if ( userData && userData.links.find(a => a.projectLink == linkResponse) ) return interaction.reply({content: `Bu proje linkinde projen zaten bulunmaktadır. Başka proje linki koyunuz.`, ephemeral: true}).catch((err) => { console.log(err.message) })

                try {

                    fetch(linkResponse)

                    let key = createRandomKey( 12 )
                    
                    await interaction.reply({content: `Link başarılı bir şekilde eklendi.`, ephemeral: true}).catch((err) => { console.log(err.message) })
                    let newProject = { projectName: nameResponse, projectLink: linkResponse, projectKey: key }
                    await linkData.updateOne({userID: interaction.user.id}, {$push: { links: newProject }}, { upsert: true })

                    let embed = new EmbedBuilder()
                    .setAuthor({name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({dynamic: true})})
                    .setColor(Colors.Green)
                    .setDescription(`${interaction.member} adlı kullanıcı \` ${ nameResponse } \` isminde proje ekledi.`)
                    .setFooter({text: `Exlusive Uptimer Logs`})

                    client.channels.cache.get(botSettings.uptimeLogs).send({embeds: [embed]}).catch((err) => { console.log(err.message) })
                } catch (err) {

                    await interaction.reply({content: `Link eklenemedi. Eklenilen proje linki hatalı olabilir.\nHata Kodu Belirtildi : \`\`\`js\n${err}\`\`\``, ephemeral: true}).catch((err) => { console.log(err.message) })
                }
            }
        })

        client.on('interactionCreate', async (interaction) => {

            if ( interaction.customId && interaction.customId == "myLinks" ) {

                let userData = await linkData.findOne({userID: interaction.user.id})
                if (!userData || !userData.links.length) return interaction.reply({content: `Eklediğin herhangi bir link bulunamadı!`, ephemeral: true})

                let map = userData.links.map( (value, index) => `\`\`\`md\n${index + 1}. ${value.projectName}\n# Link : ${value.projectLink}\`\`\``).join("\n")

                await interaction.reply({content: `${map}`, ephemeral: true})
            }
        })



        // Remove Link

        client.on('interactionCreate', async ( interaction ) => {

            if ( interaction.customId == "removeLink" ) {

                let userData = await linkData.findOne({userID: interaction.user.id})
                if (!userData || !userData.links.length) return interaction.reply({content: `Herhangi bir link eklememişsin.`, ephemeral: true}).catch((err) => { console.log(err.message) })

                let row = new StringSelectMenuBuilder()
                .setCustomId("selectDeleteLink")
                .setMaxValues(1)
                .setMinValues(1)
                .setPlaceholder("Silinecek projenizi seçiniz.")


                userData.links.slice(0, 15).forEach( project => {

                    row.addOptions({ label: `Proje : ${project.projectName}`, description: `Link : ${project.projectLink}`, value: `deleteLink/key_${project.projectKey}` })
                } )

                interaction.reply({components: [ new ActionRowBuilder().addComponents(row) ], ephemeral: true}).catch((err) => { console.log(err.message) })

            }
        })

        client.on('interactionCreate', async ( interaction ) => {

            if ( interaction.customId == "selectDeleteLink" && interaction.values ) {

                let selectedValue = interaction.values[0].replace("deleteLink/key_","")
                let userData = await linkData.findOne({userID: interaction.user.id})
                if (!userData || !userData.links.find(project => project.projectKey == selectedValue)) return interaction.reply({content: "Seçilen link veritabanında bulunamadı.", ephemeral: true}).catch((err) => { console.log(err.message) })

                let selectedProject = userData.links.find( project => project.projectKey == selectedValue)
                await linkData.updateOne({ userID: interaction.user.id }, {$pull: { links: selectedProject }}, { upsert: true })

                await interaction.update({content: "Başarılı bir şekilde seçilen link kaldırıldı.", components: [], ephemeral: true}).catch((err) => { console.log(err.message) })

                let embed = new EmbedBuilder()
                .setAuthor({name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({dynamic: true})})
                .setColor(Colors.Red)
                .setDescription(`${interaction.member} adlı kullanıcı \` ${ selectedProject.projectName } \` isimli projesini sildi.`)
                .setFooter({text: `Exlusive Uptimer Logs`})

                client.channels.cache.get(botSettings.uptimeLogs).send({embeds: [embed]}).catch((err) => { console.log(err.message) })
            }
        })
    }
}

module.exports = new Handler()