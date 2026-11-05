<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:a="http://www.w3.org/2005/Atom">
<xsl:output method="html" encoding="utf-8" doctype-system="about:legacy-compat"/>
<xsl:template match="/a:feed">
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title><xsl:value-of select="a:title"/></title>
<style>body{margin:0;font:15px/1.4 Arial,Helvetica,sans-serif;background:#f3f5f9;color:#222;overflow-wrap:anywhere;word-break:break-word}header{background:linear-gradient(#1f4fa8,#0b2d6e);color:#fff;padding:12px 14px;border-bottom:4px solid #c8102e}h1{font-size:18px;margin:0}main{max-width:760px;margin:0 auto;padding:10px}.note{background:#fff;border:1px solid #c9d2e3;border-left:4px solid #c8102e;padding:8px 10px;font-size:13px}code{white-space:pre-wrap}article{background:#fff;border:1px solid #c9d2e3;margin:10px 0;padding:10px}article h2{font-size:16px;margin:0 0 4px}a{color:#1f4fa8}small{color:#555}</style></head>
<body><header><h1><xsl:value-of select="a:title"/></h1></header><main>
<p class="note">This is an Atom feed. Copy this page's URL into your feed reader to subscribe. <a href="{a:link[@rel='alternate']/@href}">View on the site</a></p>
<xsl:for-each select="a:entry"><article><h2><a href="{a:link/@href}"><xsl:value-of select="a:title"/></a></h2><small><xsl:value-of select="a:updated"/></small><p><xsl:value-of select="a:summary"/></p></article></xsl:for-each>
<xsl:if test="not(a:entry)"><p class="note">No new sales listed right now.</p></xsl:if>
</main></body></html>
</xsl:template>
</xsl:stylesheet>
